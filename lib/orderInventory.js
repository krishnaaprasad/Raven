// Stock + coupon bookkeeping for online orders, shared by create-order, payment verify,
// the Cashfree webhook, admin payment reconcile and the daily cron.
//
// Lifecycle:
//   create-order  → reserveStock() + coupon use counted (couponUsageApplied = true)
//   payment PAID  → finalizePaidOrder(): no-op for reserved orders; deducts/counts once for
//                   legacy orders or orders whose reservation was released (late/second attempt)
//   FAILED / not paid in time → releaseReservation(): stock and coupon use go back
//
// Every transition is claimed with a conditional findOneAndUpdate on the order, so the
// verify page and the webhook running at the same time can't both apply it.

import { Order } from "@/models/Order";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
import StockLog from "@/models/StockLog";

// Cashfree payment links expire after this; unpaid reservations are released a bit later
export const PAYMENT_WINDOW_MINUTES = 30;
const RELEASE_AFTER_MINUTES = PAYMENT_WINDOW_MINUTES + 5;

// Atomically take `quantity` of one variant. $elemMatch makes size AND stock match the
// same array element (two separate conditions could match different variants).
async function takeStock(slug, size, quantity) {
  return Product.findOneAndUpdate(
    { slug, variants: { $elemMatch: { size, stock: { $gte: quantity } } } },
    { $inc: { "variants.$.stock": -quantity } },
    { new: true }
  );
}

async function giveStock(slug, size, quantity) {
  return Product.findOneAndUpdate(
    { slug, "variants.size": size },
    { $inc: { "variants.$.stock": quantity } },
    { new: true }
  );
}

function variantStock(product, size) {
  return product?.variants?.find((v) => String(v.size) === String(size))?.stock;
}

async function logStock(product, size, quantity, type, orderId, reason) {
  if (!product) return;
  const newStock = variantStock(product, size) ?? 0;
  await StockLog.create({
    productId: product._id,
    variantSize: size,
    type,
    quantity,
    previousStock: newStock - quantity,
    newStock,
    orderId,
    reason: reason || null,
    by: "system",
  }).catch((err) => console.error("StockLog write failed:", err.message));
}

/**
 * Reserve stock for cart lines before payment. All-or-nothing: if any line can't be
 * reserved, everything taken so far is put back.
 * @returns {{ ok: true } | { ok: false, item }}
 */
export async function reserveStock(items) {
  const taken = [];
  for (const item of items) {
    const quantity = Number(item.quantity);
    const product = await takeStock(item.slug, String(item.size), quantity);
    if (!product) {
      for (const t of taken) await giveStock(t.slug, t.size, t.quantity);
      return { ok: false, item };
    }
    taken.push({ slug: item.slug, size: String(item.size), quantity, product });
  }
  return { ok: true, taken };
}

/** Undo a reservation made by reserveStock() when the order itself couldn't be created. */
export async function undoReservation(taken = []) {
  for (const t of taken) await giveStock(t.slug, t.size, t.quantity);
}

/** Write ORDER_PLACED stock logs for a successful reservation. */
export async function logReservation(taken, orderId) {
  for (const t of taken) {
    await logStock(t.product, t.size, -t.quantity, "ORDER_PLACED", orderId);
  }
}

/**
 * Called whenever an order becomes PAID. Safe to call any number of times.
 * - Stock: deducts only if this order holds no live reservation (legacy order, or the
 *   reservation was released before a late/second payment attempt succeeded).
 * - Coupon: counts the use only if it isn't counted yet.
 */
export async function finalizePaidOrder(orderId) {
  // Stock
  const claimedStock = await Order.findOneAndUpdate(
    { _id: orderId, $or: [{ stockDeducted: { $ne: true } }, { stockRestored: true }] },
    { $set: { stockDeducted: true, stockRestored: false } },
    { new: true }
  );
  if (claimedStock) {
    const short = [];
    for (const item of claimedStock.cartItems || []) {
      const quantity = Number(item.quantity);
      const product = await takeStock(item.slug, String(item.size), quantity);
      if (product) {
        await logStock(product, String(item.size), -quantity, "ORDER_PLACED", claimedStock._id);
      } else {
        short.push(`${item.name} (${item.size}) x${quantity}`);
      }
    }
    if (short.length) {
      // Paid but stock ran out meanwhile — flag for the team to contact/refund the customer
      console.error(`❌ STOCK SHORTAGE on paid order ${claimedStock.customOrderId}:`, short.join(", "));
      await Order.findByIdAndUpdate(claimedStock._id, {
        stockShortage: true,
        stockShortageItems: short,
      });
    }
  }

  // Coupon
  const claimedCoupon = await Order.findOneAndUpdate(
    { _id: orderId, couponCode: { $nin: [null, ""] }, couponUsageApplied: { $ne: true } },
    { $set: { couponUsageApplied: true } },
    { new: true }
  );
  if (claimedCoupon) {
    // Customer has already paid with this discount — count it without re-checking the limit
    await Coupon.updateOne({ code: claimedCoupon.couponCode.toUpperCase() }, { $inc: { usedCount: 1 } });
  }
}

/**
 * Give back stock and coupon use for an order that did not get paid.
 * No-op for paid orders and for orders already released.
 */
export async function releaseReservation(orderId, reason = "Payment not completed") {
  const claimedStock = await Order.findOneAndUpdate(
    { _id: orderId, payment_status: { $ne: "PAID" }, stockDeducted: true, stockRestored: { $ne: true } },
    { $set: { stockRestored: true } },
    { new: true }
  );
  if (claimedStock) {
    for (const item of claimedStock.cartItems || []) {
      const quantity = Number(item.quantity);
      const product = await giveStock(item.slug, String(item.size), quantity);
      await logStock(product, String(item.size), quantity, "ORDER_CANCELLED", claimedStock._id, reason);
    }
  }

  const claimedCoupon = await Order.findOneAndUpdate(
    { _id: orderId, payment_status: { $ne: "PAID" }, couponUsageApplied: true },
    { $set: { couponUsageApplied: false } },
    { new: true }
  );
  if (claimedCoupon?.couponCode) {
    await Coupon.updateOne(
      { code: claimedCoupon.couponCode.toUpperCase(), usedCount: { $gt: 0 } },
      { $inc: { usedCount: -1 } }
    );
  }
}

/** Release reservations of online orders left unpaid past the payment window. */
export async function releaseStaleReservations(limit = 25) {
  const cutoff = new Date(Date.now() - RELEASE_AFTER_MINUTES * 60 * 1000);
  const stale = await Order.find({
    payment_status: { $in: ["PENDING", "FAILED", "CANCELLED"] },
    createdAt: { $lte: cutoff },
    $or: [
      { stockDeducted: true, stockRestored: { $ne: true } },
      { couponUsageApplied: true },
    ],
    cf_order_id: { $exists: true, $ne: null }, // online (Cashfree) orders only, never manual/admin ones
  })
    .select("_id")
    .limit(limit)
    .lean();

  for (const o of stale) {
    try {
      await releaseReservation(o._id, "Payment window expired");
    } catch (err) {
      console.error("Release reservation failed:", o._id, err.message);
    }
  }
  return stale.length;
}
