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

    const baseUrl =
      process.env.NEXT_PUBLIC_CASHFREE_ENV === "production"
        ? "https://api.cashfree.com/pg/orders"
        : "https://sandbox.cashfree.com/pg/orders";

    // ✅ Step 1: Verify payment status
    const cfResponse = await axios.get(`${baseUrl}/${cfOrderId}`, {
      headers: {
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        "x-api-version": "2022-09-01",
      },
    });

    const cfData = cfResponse.data;
    const isPaid =
      cfData.order_status?.toUpperCase() === "PAID" ||
      cfData.order_status?.toUpperCase() === "SUCCESS";

    let paymentMethod = "Cashfree";
    let paymentDetails = "";
    let referenceId =
      cfData.reference_id ||
      cfData.cf_order_id ||
      cfData.order_id ||
      "N/A";

    // ✅ Step 2: If paid, fetch detailed payment info
    if (isPaid) {
      try {
        const paymentsRes = await axios.get(
          `${baseUrl}/${cfOrderId}/payments`,
          {
            headers: {
              "x-client-id": process.env.CASHFREE_APP_ID,
              "x-client-secret": process.env.CASHFREE_SECRET_KEY,
              "x-api-version": "2022-09-01",
            },
          }
        );

        const payments = paymentsRes.data?.payments || [];
        const latest = payments[0]; // usually only 1 successful payment

        if (latest) {
          const method = latest.payment_method?.toLowerCase();

          if (method === "upi" && latest.upi?.upi_id) {
            paymentMethod = "UPI";
            paymentDetails = latest.upi.upi_id;
          } else if (method === "card" && latest.card) {
            const { network, last4 } = latest.card;
            paymentMethod = network || "Card";
            paymentDetails = `ending in ${last4}`;
          } else if (method === "netbanking" && latest.netbanking) {
            paymentMethod = "NetBanking";
            paymentDetails = latest.netbanking.bank_name || "";
          } else {
            paymentMethod = method?.toUpperCase() || "Cashfree";
          }

          if (latest.cf_payment_id) referenceId = latest.cf_payment_id;
        }
      } catch (err) {
        console.warn("⚠️ Could not fetch payment details:", err.message);
      }
    }

    // ✅ Step 3: Save everything in MongoDB
    await Order.findByIdAndUpdate(orderId, {
      status: isPaid ? "PAID" : "FAILED",
      referenceId,
      transactionDate: new Date(),
      paymentGateway: paymentMethod,
      paymentDetails,
    });

    return NextResponse.json({
      success: isPaid,
      paid: isPaid,
      amount: order.totalAmount,
      referenceId,
      paymentMethod,
      paymentDetails,
      message: isPaid ? "Payment verified successfully" : "Payment failed",
    });
  } catch (error) {
    console.error("❌ Verify API error:", error.response?.data || error.message);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
