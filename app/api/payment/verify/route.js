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

    // ✅ 1️⃣ Verify base order
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
    let paymentDetails = {};

    // ✅ 2️⃣ Fetch detailed payment info if paid
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
        console.log("✅ Cashfree payment data:", payment);

        if (payment) {
          // 🟢 UPI
          if (payment.payment_method?.upi) {
            const upiId = payment.payment_method.upi?.upi_id || "unknown@upi";
            paymentMethod = `UPI (${upiId})`;
            paymentDetails = { type: "UPI", upiId };
          }

          // 🔵 Card
          else if (payment.payment_method?.card) {
            const cardData = payment.payment_method.card;
            const fullCard = cardData?.card_number || "";
            const last4 =
              fullCard.slice(-4) || "XXXX"; // ✅ Extract from masked number
            const network =
              cardData?.card_network?.toUpperCase() || "CARD";
            const bankName = cardData?.card_bank_name || "Bank";

            paymentMethod = `${network} ending in ${last4}`;
            paymentDetails = {
              type: "CARD",
              network,
              last4,
              bank: bankName,
            };
          }

          // 🟠 Netbanking
          else if (payment.payment_method?.netbanking) {
            const bankCode =
              payment.payment_method.netbanking?.bank_code || "BANK";
            paymentMethod = `NetBanking (${bankCode})`;
            paymentDetails = { type: "NETBANKING", bankCode };
          }

          // 🪙 Wallet
          else if (payment.payment_method?.wallet) {
            const provider =
              payment.payment_method.wallet?.provider || "Wallet";
            paymentMethod = `Wallet (${provider})`;
            paymentDetails = { type: "WALLET", provider };
          }

          // ⚪️ Default fallback
          else {
            paymentMethod = "Online Payment (Cashfree)";
            paymentDetails = { type: "OTHER" };
          }
        } else if (!isProduction) {
          // Sandbox fallback
          paymentMethod = "UPI (testsuccess@gocash)";
          paymentDetails = { type: "UPI", upiId: "testsuccess@gocash" };
        }
      } catch (err) {
        console.warn("⚠️ Could not fetch payment details:", err.message);
        if (!isProduction) {
          paymentMethod = "UPI (testsuccess@gocash)";
          paymentDetails = { type: "UPI", upiId: "testsuccess@gocash" };
        }
      }
    }

    // ✅ 3️⃣ Reference ID
    const referenceId =
      cfData.reference_id ||
      cfData.cf_order_id ||
      cfData.order_id ||
      order.referenceId ||
      "N/A";

    // ✅ 4️⃣ Save clean structured info
    await Order.findByIdAndUpdate(orderId, {
      status: isPaid ? "PAID" : "FAILED",
      referenceId,
      transactionDate: new Date(),
      paymentMethod,
      paymentDetails,
      verified: isPaid,
    });

    return NextResponse.json({
      success: isPaid,
      paid: isPaid,
      referenceId,
      paymentMethod,
      paymentDetails,
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
