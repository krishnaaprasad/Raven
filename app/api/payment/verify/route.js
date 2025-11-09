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

    const isProduction = process.env.NEXT_PUBLIC_CASHFREE_ENV === "production";
    const baseUrl = isProduction
      ? "https://api.cashfree.com/pg/orders"
      : "https://sandbox.cashfree.com/pg/orders";

    // 1️⃣ Verify payment status
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

    // 2️⃣ Get more detailed payment info if possible
    if (isPaid) {
      try {
        const paymentRes = await axios.get(`${baseUrl}/${cfOrderId}/payments`, {
          headers: {
            "x-client-id": process.env.CASHFREE_APP_ID,
            "x-client-secret": process.env.CASHFREE_SECRET_KEY,
            "x-api-version": "2022-09-01",
          },
        });

        const payments = Array.isArray(paymentRes.data)
          ? paymentRes.data
          : paymentRes.data?.data || [];

        const payment = payments[0];

        if (payment) {
          const method = payment.payment_method?.toUpperCase();

          if (method === "UPI") {
            const upiId = payment.upi?.upi_id || "test@upi";
            paymentMethod = `UPI (${upiId})`;
          } else if (method === "CARD") {
            const network = payment.card?.card_network || "VISA";
            const last4 = payment.card?.card_last4 || "XXXX";
            paymentMethod = `${network} ending in ${last4}`;
          } else if (method === "NETBANKING") {
            const bank = payment.bank_code || "Bank";
            paymentMethod = `NetBanking (${bank})`;
          } else if (method === "WALLET") {
            const wallet = payment.wallet?.provider || "Wallet";
            paymentMethod = `Wallet (${wallet})`;
          } else {
            paymentMethod = method || "Cashfree";
          }
        } else if (!isProduction) {
          paymentMethod = "UPI (test@upi)";
        }
      } catch (err) {
        console.warn("⚠️ Could not fetch payment details:", err.message);
        if (!isProduction) paymentMethod = "UPI (test@upi)";
      }
    }

    const referenceId =
      cfData.reference_id ||
      cfData.cf_order_id ||
      cfData.order_id ||
      order.referenceId ||
      "N/A";

    // ✅ Always store string
    if (typeof paymentMethod !== "string") {
      paymentMethod = JSON.stringify(paymentMethod);
    }

    // 3️⃣ Update DB safely
    await Order.findByIdAndUpdate(orderId, {
      status: isPaid ? "PAID" : "FAILED",
      referenceId,
      transactionDate: new Date(),
      paymentMethod: String(paymentMethod),
      verified: isPaid,
    });

    return NextResponse.json({
      success: isPaid,
      paid: isPaid,
      amount: order.totalAmount,
      referenceId,
      paymentMethod,
      message: isPaid
        ? "Payment verified successfully"
        : "Payment verification failed",
    });
  } catch (error) {
    console.error("❌ Verify API error:", error.response?.data || error.message);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
