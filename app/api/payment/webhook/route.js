import "@/models/User";
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import axios from "axios";
import { finalizePaidOrder, releaseReservation } from "@/lib/orderInventory";
import { sendOrderConfirmationOnce } from "@/lib/orderEmail";
import crypto from "crypto";

// Cashfree signs webhooks: base64(HMAC_SHA256(timestamp + rawBody, secretKey))
function isValidCashfreeSignature(rawBody, timestamp, signature) {
  const secret = process.env.CASHFREE_SECRET_KEY;
  if (!secret || !timestamp || !signature) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(timestamp + rawBody)
    .digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-webhook-signature");
    const timestamp = req.headers.get("x-webhook-timestamp");

    // Reject forged webhooks — otherwise anyone could mark an order as PAID
    if (!isValidCashfreeSignature(rawBody, timestamp, signature)) {
      console.warn("⚠️ Webhook rejected: invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    console.log("📩 Webhook Received:", body?.type, body?.data?.order?.order_id);

    // Handle Cashfree TEST webhook (no order payload)
    if (!body?.data?.order) {
      return NextResponse.json(
        { received: true, test: true, message: "Webhook test received" },
        { status: 200 }
      );
    }

    await connectToDatabase();

    const merchantOrderId = body.data.order.order_id;
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

    // Map gateway status → business status
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
      payment_status = "FAILED";
      order_status = "Cancelled";
    }

    // Locate the order
    const matchQuery = merchantOrderId
      ? { customOrderId: merchantOrderId }
      : { cf_order_id: cfOrderId };

    const existingOrder = await Order.findOne(matchQuery);

    if (!existingOrder) {
      console.warn("⚠️ Webhook: no order found for", matchQuery);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Idempotency: if already PAID + verified, don't re-process
    const alreadyFinalized =
      existingOrder.payment_status === "PAID" && existingOrder.verified === true;

    if (alreadyFinalized) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // -----------------------------------------
    // Fetch payment method details from Cashfree (UPI/Card/NB/Wallet)
    // -----------------------------------------
    let paymentMethod = "Cashfree";
    let paymentDetails = {};

    if (payment_status === "PAID") {
      const isProduction = process.env.NEXT_PUBLIC_CASHFREE_ENV === "production";
      const baseUrl = isProduction
        ? "https://api.cashfree.com/pg/orders"
        : "https://sandbox.cashfree.com/pg/orders";

      const lookupId = merchantOrderId || existingOrder.customOrderId;

      try {
        const paymentRes = await axios.get(`${baseUrl}/${lookupId}/payments`, {
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

        if (payment?.payment_method?.upi) {
          const upiId = payment.payment_method.upi?.upi_id || "unknown@upi";
          paymentMethod = `UPI (${upiId})`;
          paymentDetails = { type: "UPI", upiId };
        } else if (payment?.payment_method?.card) {
          const card = payment.payment_method.card;
          const last4 = (card?.card_number || "").slice(-4) || "XXXX";
          const network = card?.card_network?.toUpperCase() || "CARD";
          const bank = card?.card_bank_name || "Bank";
          paymentMethod = `${network} ending in ${last4}`;
          paymentDetails = { type: "CARD", last4, network, bank };
        } else if (payment?.payment_method?.netbanking) {
          const bankCode = payment.payment_method.netbanking?.bank_code || "BANK";
          paymentMethod = `NetBanking (${bankCode})`;
          paymentDetails = { type: "NETBANKING", bankCode };
        } else if (payment?.payment_method?.wallet) {
          const provider = payment.payment_method.wallet?.provider || "Wallet";
          paymentMethod = `Wallet (${provider})`;
          paymentDetails = { type: "WALLET", provider };
        } else if (!isProduction) {
          paymentMethod = "UPI (testsuccess@gocash)";
          paymentDetails = { type: "UPI", upiId: "testsuccess@gocash" };
        } else {
          paymentMethod = "Online Payment (Cashfree)";
          paymentDetails = { type: "OTHER" };
        }
      } catch (err) {
        console.warn("⚠️ Webhook: Could not fetch payment details:", err.message);
        if (!isProduction) {
          paymentMethod = "UPI (testsuccess@gocash)";
          paymentDetails = { type: "UPI", upiId: "testsuccess@gocash" };
        }
      }
    }

    // -----------------------------------------
    // Update order
    // -----------------------------------------
    const updatePayload = {
      payment_state,
      payment_status,
      order_status,
      status: payment_status,
      verified: payment_status === "PAID",
      transactionDate: new Date(),
      paymentMethod: payment_status === "PAID" ? paymentMethod : "Payment Failed",
      paymentDetails: payment_status === "PAID" ? paymentDetails : {},
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
    // Stock + coupon bookkeeping (each applied exactly once, see lib/orderInventory.js)
    // -----------------------------------------
    if (payment_status === "PAID") {
      await finalizePaidOrder(updatedOrder._id);
    } else if (payment_status === "FAILED" || payment_status === "CANCELLED") {
      await releaseReservation(updatedOrder._id, `Payment ${rawStatus || payment_status}`);
    }

    // -----------------------------------------
    // Send confirmation email + WhatsApp on successful payment
    // -----------------------------------------
    if (payment_status === "PAID") {
      // Send confirmation email
      try {
        await sendOrderConfirmationOnce(updatedOrder._id, paymentMethod);
      } catch (mailErr) {
        console.error("❌ Webhook email error:", mailErr);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
