import "@/models/User";
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import axios from "axios";
import { generateInvoice } from "@/lib/invoice/generateInvoice"; // ✅ still here

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

    // -----------------------------------------
    // 1️⃣ VERIFY ORDER WITH CASHFREE
    // -----------------------------------------
    const cfResponse = await axios.get(`${baseUrl}/${cfOrderId}`, {
      headers: {
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        "x-api-version": "2022-09-01",
      },
    });

    const cfData = cfResponse.data;

    // This is the Cashfree "order_status" / payment state
    const state = (cfData?.order_status || "").toUpperCase();

    // SUCCESS flag (used for email + old logic)
    const isPaid = state === "PAID" || state === "SUCCESS";

    let paymentMethod = "Cashfree";
    let paymentDetails = {};

    // -----------------------------------------
    // 2️⃣ GET PAYMENT DETAILS (UPI / CARD / NB)
    // -----------------------------------------
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
          // UPI
          if (payment.payment_method?.upi) {
            const upiId = payment.payment_method.upi?.upi_id || "unknown@upi";
            paymentMethod = `UPI (${upiId})`;
            paymentDetails = { type: "UPI", upiId };
          }

          // CARD
          else if (payment.payment_method?.card) {
            const card = payment.payment_method.card;
            const last4 = (card?.card_number || "").slice(-4) || "XXXX";
            const network = card?.card_network?.toUpperCase() || "CARD";
            const bank = card?.card_bank_name || "Bank";

            paymentMethod = `${network} ending in ${last4}`;
            paymentDetails = {
              type: "CARD",
              last4,
              network,
              bank,
            };
          }

          // NETBANKING
          else if (payment.payment_method?.netbanking) {
            const bankCode =
              payment.payment_method.netbanking?.bank_code || "BANK";
            paymentMethod = `NetBanking (${bankCode})`;
            paymentDetails = { type: "NETBANKING", bankCode };
          }

          // WALLET
          else if (payment.payment_method?.wallet) {
            const provider =
              payment.payment_method.wallet?.provider || "Wallet";
            paymentMethod = `Wallet (${provider})`;
            paymentDetails = { type: "WALLET", provider };
          }

          // DEFAULT
          else {
            paymentMethod = "Online Payment (Cashfree)";
            paymentDetails = { type: "OTHER" };
          }
        } else if (!isProduction) {
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

    // -----------------------------------------
    // 3️⃣ REFERENCE ID
    // -----------------------------------------
    const referenceId =
      cfData.reference_id ||
      cfData.cf_order_id ||
      cfData.order_id ||
      order.referenceId ||
      "N/A";

    // -----------------------------------------
    // 4️⃣ NEW MAPPING: payment_state → payment_status → order_status
    // -----------------------------------------

    // Raw state from Cashfree (SUCCESS, PENDING, FAILED, CANCELLED, VOID, USER_DROPPED, etc.)
    // Normalized gateway state
    let payment_state = state || "NOT_ATTEMPTED";

    // Business display status
    let payment_status = "PENDING";

    // Convert Cashfree PAID → SUCCESS for schema compatibility
    if (payment_state === "PAID" || payment_state === "SUCCESS") {
      payment_state = "SUCCESS";       // MongoDB friendly enum
      payment_status = "PAID";         // Shown in UI
    } else if (payment_state === "PENDING" || payment_state === "NOT_ATTEMPTED") {
      payment_status = "PENDING";
    } else if (["CANCELLED", "VOID"].includes(payment_state)) {
      payment_status = "CANCELLED";
    } else {
      payment_status = "FAILED";       // FAILED, USER_DROPPED, FLAGGED, etc.
    }

    let order_status = "Payment Awaiting";
    if (payment_status === "PAID") {
      order_status = "Processing";
    } else if (
      payment_status === "FAILED" ||
      payment_status === "CANCELLED"
    ) {
      order_status = "Cancelled";
    }

    // Legacy `status` field kept in sync for old code
    const legacyStatusMap = {
      PAID: "PAID",
      PENDING: "PENDING",
      FAILED: "FAILED",
      CANCELLED: "CANCELLED",
    };
    const legacyStatus = legacyStatusMap[payment_status] || "PENDING";

    // -----------------------------------------
    // 5️⃣ UPDATE ORDER IN DB
    // -----------------------------------------
    await Order.findByIdAndUpdate(orderId, {
      payment_state,
      payment_status,
      order_status,
      status: legacyStatus,
      referenceId,
      transactionDate: new Date(),
      paymentMethod: payment_status === "PAID" ? paymentMethod : "Payment Failed",
      paymentDetails: payment_status === "PAID" ? paymentDetails : {},
      verified: payment_status === "PAID",
    });

    // -----------------------------------------
    // 6️⃣ SEND EMAIL ONLY ONCE AFTER SUCCESSFUL PAYMENT
    // -----------------------------------------
    if (payment_status === "PAID" || payment_state === "SUCCESS") {
      try {
        // Always read fresh from database
        let updatedOrder = await Order.findById(orderId);

        if (updatedOrder.emailSent === true) {
          console.log("📨 Email already sent earlier — skipping.");
        } else {
          console.log("📨 Sending confirmation mail for FIRST time...");

          const emailPayload = {
            email: updatedOrder.email,
            name: updatedOrder.userName,
            orderId:
              updatedOrder.customOrderId || updatedOrder._id.toString(),
            paymentMethod,
            subtotal: updatedOrder.cartItems.reduce(
              (acc, item) => acc + item.price * item.quantity,
              0
            ),
            shippingCost: updatedOrder.shippingCharge,
            totalAmount: updatedOrder.totalAmount,
            items: updatedOrder.cartItems,
            shipping: updatedOrder.deliveryType,
            address: {
              ...updatedOrder.addressDetails,
              phone: updatedOrder.phone,
            },
          };

          // Fire-and-forget email trigger
          fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/send-confirmation-mail`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(emailPayload),
            }
          )
            .then(() => console.log("📨 Email triggered successfully"))
            .catch((err) =>
              console.error("📩 Email trigger error:", err)
            );

          // Mark as sent
          updatedOrder.emailSent = true;
          await updatedOrder.save();
          console.log("✅ emailSent flag saved in DB");
        }
      } catch (mailErr) {
        console.error("❌ Email Sending Error:", mailErr);
      }
    }

    return NextResponse.json({
      success: payment_status === "PAID",
      paid: payment_status === "PAID",
      referenceId,
      paymentMethod,
      paymentDetails,
      payment_state,
      payment_status,
      order_status,
      message:
        payment_status === "PAID"
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
