import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import axios from "axios";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const cfOrderId = searchParams.get("cfOrderId");

    if (!orderId || !cfOrderId) {
      return NextResponse.json(
        { success: false, message: "Missing parameters" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Dynamically pick Cashfree URL based on environment
    const baseUrl =
      process.env.NEXT_PUBLIC_CASHFREE_ENV === "production"
        ? "https://api.cashfree.com/pg/orders"
        : "https://sandbox.cashfree.com/pg/orders";

    const cfResponse = await axios.get(`${baseUrl}/${cfOrderId}`, {
      headers: {
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        "x-api-version": "2022-09-01",
      },
    });

    const cfData = cfResponse.data;

    // 🔹 Debug log (optional, remove in production)
    console.log("Cashfree response:", JSON.stringify(cfData, null, 2));

    // Grab referenceId safely from multiple possible paths
    const referenceId =
      cfData.reference_id ||
      cfData.order?.reference_id ||
      cfData.data?.reference_id ||
      cfData.cf_order_id ||
      order.referenceId ||
      "N/A";

    const paymentStatus = cfData.order_status === "PAID" ? "PAID" : "FAILED";

    // Update order in DB
    order.status = paymentStatus;
    order.referenceId = referenceId;
    order.transactionDate = new Date();
    await order.save();

    return NextResponse.json({
      success: paymentStatus === "PAID",
      amount: order.totalAmount,
      paid: paymentStatus === "PAID",
      referenceId: referenceId,
    });
  } catch (error) {
    console.error(
      "Verify API error:",
      error.response?.data || error.message || error
    );
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
