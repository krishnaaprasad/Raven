import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();

    console.log("📩 Webhook received:", body);

    const event = body?.type;
    const orderIdFromGateway = body?.data?.order?.cf_order_id;
    const paymentStatus = body?.data?.order?.order_status?.toUpperCase();

    if (!orderIdFromGateway || !paymentStatus) {
      return NextResponse.json(
        { message: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    // Map CF statuses to your status pattern
    let payment_state = paymentStatus;
    let payment_status = "PENDING";
    let order_status = "Payment Awaiting";

    if (paymentStatus === "PAID" || paymentStatus === "SUCCESS") {
      payment_state = "SUCCESS";
      payment_status = "PAID";
      order_status = "Processing";
    } else if (["FAILED", "USER_DROPPED", "FLAGGED"].includes(paymentStatus)) {
      payment_status = "FAILED";
      order_status = "Cancelled";
    } else if (["CANCELLED", "VOID"].includes(paymentStatus)) {
      payment_status = "CANCELLED";
      order_status = "Cancelled";
    }

    const updated = await Order.findOneAndUpdate(
      { cf_order_id: orderIdFromGateway },
      {
        payment_state,
        payment_status,
        order_status,
        status: payment_status,
        verified: payment_status === "PAID",
        paymentDetails: body,
        transactionDate: new Date(),
      },
      { new: true }
    );

    if (!updated) {
      console.log("⚠ Order not found for webhook");
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    console.log("🎉 Order updated by webhook:", updated.customOrderId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
