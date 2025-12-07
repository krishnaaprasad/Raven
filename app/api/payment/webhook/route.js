import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("📩 Webhook Received:", JSON.stringify(body, null, 2));

    // Handle Cashfree TEST webhook
    if (!body?.data?.order) {
      return NextResponse.json(
        { received: true, test: true, message: "Webhook test received" },
        { status: 200 }
      );
    }

    await connectToDatabase();

    const orderIdFromGateway = body.data.order.cf_order_id;
    const paymentStatus = body.data.order.order_status?.toUpperCase();

    let payment_status = "PENDING";
    let order_status = "Payment Awaiting";

    if (paymentStatus === "SUCCESS" || paymentStatus === "PAID") {
      payment_status = "PAID";
      order_status = "Processing";
    } else if (paymentStatus === "FAILED") {
      payment_status = "FAILED";
      order_status = "Cancelled";
    }

    await Order.findOneAndUpdate(
      { cf_order_id: orderIdFromGateway },
      {
        payment_status,
        order_status,
        status: payment_status,
        verified: payment_status === "PAID",
        transactionDate: new Date(),
        paymentDetails: body,
      },
      { new: true }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
