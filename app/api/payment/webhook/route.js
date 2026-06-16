import "@/models/User";
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import Coupon from "@/models/Coupon";
import { sendOrderConfirmation } from "@/lib/notifications/whatsapp.service";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("📩 Webhook Received:", JSON.stringify(body, null, 2));

    // Handle Cashfree TEST webhook (no order payload)
    if (!body?.data?.order) {
      return NextResponse.json(
        { received: true, test: true, message: "Webhook test received" },
        { status: 200 }
      );
    }

    await connectToDatabase();

    // -----------------------------------------
    // Extract identifiers + status from the ACTUAL Cashfree payload
    // (API version 2022-09-01)
    //   data.order.order_id      → our merchant order id (= customOrderId)
    //   data.order.cf_order_id   → Cashfree's order id (not always present)
    //   data.payment.payment_status → SUCCESS | FAILED | PENDING | ...
    // Older/test payloads sometimes used data.order.order_status, so we fall
    // back to that if payment.payment_status is missing.
    // -----------------------------------------
    const merchantOrderId = body.data.order.order_id; // = customOrderId
    const cfOrderId = body.data.order.cf_order_id || null;

    const rawStatus = (
      body.data.payment?.payment_status ||
      body.data.order?.order_status ||
      ""
    ).toUpperCase();

    if (!merchantOrderId && !cfOrderId) {
      console.warn("⚠️ Webhook missing order identifiers, ignoring.");
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // -----------------------------------------
    // Map gateway status → business status
    // -----------------------------------------
    let payment_state = rawStatus || "PENDING";
    let payment_status = "PENDING";
    let order_status = "Payment Awaiting";

    if (rawStatus === "SUCCESS" || rawStatus === "PAID") {
      payment_state = "SUCCESS";
      payment_status = "PAID";
      order_status = "Processing";
    } else if (["CANCELLED", "VOID"].includes(rawStatus)) {
      payment_status = "CANCELLED";
      order_status = "Cancelled";
    } else if (rawStatus && rawStatus !== "PENDING") {
      // FAILED, USER_DROPPED, FLAGGED, etc.
      payment_status = "FAILED";
      order_status = "Cancelled";
    }

    // -----------------------------------------
    // Locate the order (prefer customOrderId, fall back to cf_order_id)
    // -----------------------------------------
    const matchQuery = merchantOrderId
      ? { customOrderId: merchantOrderId }
      : { cf_order_id: cfOrderId };

    const existingOrder = await Order.findOne(matchQuery);

    if (!existingOrder) {
      console.warn("⚠️ Webhook: no order found for", matchQuery);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Idempotency: if already PAID + verified, don't downgrade or re-notify
    const alreadyFinalized =
      existingOrder.payment_status === "PAID" && existingOrder.verified === true;

    const updatePayload = {
      payment_state,
      payment_status,
      order_status,
      status: payment_status,
      verified: payment_status === "PAID",
      transactionDate: new Date(),
      paymentDetails: body,
    };

    if (cfOrderId && !existingOrder.cf_order_id) {
      updatePayload.cf_order_id = cfOrderId;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      existingOrder._id,
      updatePayload,
      { new: true }
    );

    // -----------------------------------------
    // Apply coupon usage once on successful payment
    // -----------------------------------------
    if (
      payment_status === "PAID" &&
      updatedOrder?.couponCode &&
      !updatedOrder?.couponUsageApplied
    ) {
      try {
        const now = new Date();
        const reservedCoupon = await Coupon.findOneAndUpdate(
          {
            code: updatedOrder.couponCode.toUpperCase(),
            isActive: true,
            deleted: { $ne: true },
            $and: [
              {
                $or: [
                  { expiryDate: { $exists: false } },
                  { expiryDate: null },
                  { expiryDate: { $gte: now } },
                ],
              },
              {
                $or: [
                  { usageLimit: { $exists: false } },
                  { usageLimit: null },
                  { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
                ],
              },
            ],
          },
          { $inc: { usedCount: 1 } },
          { new: true }
        );

        if (reservedCoupon) {
          await Order.findOneAndUpdate(
            { _id: updatedOrder._id, couponUsageApplied: { $ne: true } },
            {
              $set: {
                couponUsageApplied: true,
                "paymentDetails.couponUsageApplied": true,
              },
            },
            { new: true }
          );
        }
      } catch (couponErr) {
        console.error("❌ Webhook coupon usage update error:", couponErr);
      }
    }

    // -----------------------------------------
    // Send confirmation once (skip if order was already finalized)
    // -----------------------------------------
    if (payment_status === "PAID" && !alreadyFinalized) {
      try {
        await sendOrderConfirmation(updatedOrder);
      } catch (whatsappErr) {
        console.error("❌ Webhook WhatsApp confirmation error:", whatsappErr);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
