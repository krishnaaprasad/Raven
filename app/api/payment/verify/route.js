import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
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

    // ✅ 1️⃣ Verify payment
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

    // ✅ 2️⃣ Try fetching payment details
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
          let method = "CASHFREE";

          // ✅ Handle sandbox + production safely
          if (typeof payment.payment_method === "string") {
            method = payment.payment_method.toUpperCase();
          } else if (typeof payment.payment_method === "object") {
            if (payment.payment_method.upi) method = "UPI";
            else if (payment.payment_method.card) method = "CARD";
            else if (payment.payment_method.netbanking) method = "NETBANKING";
            else if (payment.payment_method.wallet) method = "WALLET";
          }

          if (method === "UPI") {
            const upiId =
              payment.upi?.upi_id ||
              payment.payment_method?.upi?.upi_id ||
              "testsuccess@gocash";
            paymentMethod = `UPI (${upiId})`;
          } else if (method === "CARD") {
            const network =
              payment.card?.card_network ||
              payment.payment_method?.card?.card_network ||
              "VISA";
            const last4 =
              payment.card?.card_last4 ||
              payment.payment_method?.card?.card_last4 ||
              "XXXX";
            paymentMethod = `${network} ending in ${last4}`;
          } else if (method === "NETBANKING") {
            const bank =
              payment.bank_code ||
              payment.payment_method?.netbanking?.bank_code ||
              "Bank";
            paymentMethod = `NetBanking (${bank})`;
          } else if (method === "WALLET") {
            const wallet =
              payment.wallet?.provider ||
              payment.payment_method?.wallet?.provider ||
              "Wallet";
            paymentMethod = `Wallet (${wallet})`;
          } else {
            paymentMethod = method;
          }
        } else if (!isProduction) {
          paymentMethod = "UPI (testsuccess@gocash)";
        }
      } catch (err) {
        console.warn("⚠️ Could not fetch payment details:", err.message);
        if (!isProduction) paymentMethod = "UPI (testsuccess@gocash)";
      }
    }

    // ✅ 3️⃣ Reference ID fallback
    const referenceId =
      cfData.reference_id ||
      cfData.cf_order_id ||
      cfData.order_id ||
      order.referenceId ||
      "N/A";

    // ✅ 4️⃣ Save clean readable payment data
    await Order.findByIdAndUpdate(orderId, {
      status: isPaid ? "PAID" : "FAILED",
      referenceId,
      transactionDate: new Date(),
      paymentMethod,
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
