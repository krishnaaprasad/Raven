import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { takeStock, giveStock, logStock } from "@/lib/orderInventory";
import { buildManualLines, qtyBySku } from "@/lib/manualOrderItems";

function trackChange(changes, label, oldVal, newVal) {
  if (String(oldVal ?? "") !== String(newVal ?? "")) {
    changes.push({
      field: label,
      from: oldVal ?? "--",
      to: newVal ?? "--",
    });
  }
}

export async function PUT(req, context) {
  try {
    await connectToDatabase();

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order ID missing" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    if (!order.cartItems || order.cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid order items" },
        { status: 400 }
      );
    }

    // ❌ Block website / Cashfree orders
    if (order.paymentGateway !== "Manual") {
      return NextResponse.json(
        { success: false, error: "Only manual orders can be edited" },
        { status: 403 }
      );
    }

    const {
      userName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      items,
      // legacy single-product fields (older admin page)
      quantity,
      price,
      variantSize,
      shippingCharge,
      paymentMethod,
      remark,
      discount,
      couponCode,
    } = body;

    const changes = [];
    const oldLines = order.cartItems.map((l) => (l.toObject ? l.toObject() : l));

    // Product lines: the full list from the modal, or the old single-line fields
    const rawItems = Array.isArray(items) && items.length
      ? items
      : [{
          slug: oldLines[0].slug,
          variantSize: variantSize || oldLines[0].size,
          quantity: quantity ?? oldLines[0].quantity,
          price: price ?? oldLines[0].price,
        }];
    const built = await buildManualLines(rawItems);
    if (!built.ok) {
      return NextResponse.json({ success: false, error: built.error }, { status: 400 });
    }
    const { lines: newLines, subtotal: subTotal } = built;

    const shipAmount = Number(shippingCharge ?? order.shippingCharge ?? 0);
    const discountAmount = Number(discount ?? order.discount ?? 0);
    if (!Number.isFinite(shipAmount) || shipAmount < 0) {
      return NextResponse.json({ success: false, error: "Invalid shipping charge" }, { status: 400 });
    }
    if (!Number.isFinite(discountAmount) || discountAmount < 0 || discountAmount > subTotal) {
      return NextResponse.json({ success: false, error: "Discount must be between 0 and the subtotal" }, { status: 400 });
    }

    // 📦 Keep stock in step with the edit (only while this order holds stock).
    // Take every increase first (all-or-nothing), then give back every decrease.
    const holdsStock = order.stockDeducted && !order.stockRestored;
    const oldQty = qtyBySku(oldLines);
    const newQty = qtyBySku(newLines);
    const applied = []; // for rollback if saving fails
    if (holdsStock) {
      const keys = new Set([...oldQty.keys(), ...newQty.keys()]);
      for (const key of keys) {
        const diff = (newQty.get(key) || 0) - (oldQty.get(key) || 0);
        if (diff <= 0) continue;
        const [slug, size] = key.split("|");
        const taken = await takeStock(slug, size, diff);
        if (!taken) {
          for (const a of applied) await giveStock(a.slug, a.size, a.qty);
          return NextResponse.json({ success: false, error: `Not enough stock for ${slug} (${size})` }, { status: 400 });
        }
        applied.push({ slug, size, qty: diff });
        await logStock(taken, size, -diff, "CORRECTION", order._id, "Manual order edited");
      }
      for (const key of keys) {
        const diff = (newQty.get(key) || 0) - (oldQty.get(key) || 0);
        if (diff >= 0) continue;
        const [slug, size] = key.split("|");
        const back = await giveStock(slug, size, -diff);
        applied.push({ slug, size, qty: diff });
        await logStock(back, size, -diff, "CORRECTION", order._id, "Manual order edited");
      }
    }

    // 📊 Track changes
    const describe = (ls) => ls.map((l) => `${l.name} ${l.size} ×${l.quantity} @₹${l.price}`).join(", ");
    trackChange(changes, "Customer Name", order.userName, userName);
    trackChange(changes, "Phone", order.phone, phone);
    trackChange(changes, "Email", order.email, email);

    trackChange(changes, "Address", order.addressDetails?.address1, address);
    trackChange(changes, "City", order.addressDetails?.city, city);
    trackChange(changes, "State", order.addressDetails?.state, state);
    trackChange(changes, "Pincode", order.addressDetails?.pincode, pincode);

    trackChange(changes, "Items", describe(oldLines), describe(newLines));
    trackChange(changes, "Shipping", order.shippingCharge, shipAmount);
    trackChange(changes, "Discount", order.discount, discountAmount);
    trackChange(changes, "Coupon Code", order.couponCode, couponCode || null);
    trackChange(changes, "Payment Method", order.paymentMethod, paymentMethod);

    // ✏️ Update editable fields (after change tracking, which compares against the old values)
    order.cartItems = newLines;
    order.shippingCharge = shipAmount;
    order.discount = discountAmount;
    order.couponCode = couponCode || null;
    order.totalAmount = Math.max(0, subTotal + shipAmount - discountAmount);

    order.userName = userName;
    order.email = email;
    order.phone = phone;
    order.addressDetails = {
      address1: address,
      city,
      state,
      pincode,
    };
    order.paymentMethod = paymentMethod;

    if (remark && changes.length > 0) changes.push({ field: "Note", from: "--", to: remark });

    if (changes.length > 0) {
      order.orderHistory.push({
        type: "EDIT",
        at: new Date(),
        by: "admin",
        changes,
      });
    }

    try {
      await order.save();
    } catch (saveErr) {
      // Undo the stock changes so inventory matches the unchanged order
      for (const a of applied) {
        if (a.qty > 0) await giveStock(a.slug, a.size, a.qty);
        else await takeStock(a.slug, a.size, -a.qty);
      }
      throw saveErr;
    }

    return NextResponse.json({ success: true, order });
  } catch (e) {
    console.error("❌ EDIT ORDER ERROR:", e);
    return NextResponse.json(
      { success: false, error: "Failed to edit order" },
      { status: 500 }
    );
  }
}