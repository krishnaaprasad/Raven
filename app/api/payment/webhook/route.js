import "@/models/User";
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import Coupon from "@/models/Coupon";
import { sendOrderConfirmation } from "@/lib/notifications/whatsapp.service";
import axios from "axios";

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
    // Apply coupon usage once
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
    // Send confirmation email + WhatsApp on successful payment
    // -----------------------------------------
    if (payment_status === "PAID") {
      // Send confirmation email
      try {
        const freshOrder = await Order.findById(updatedOrder._id);

        if (!freshOrder.emailSent) {
          const emailPayload = {
            email: freshOrder.email,
            name: freshOrder.userName,
            orderId: freshOrder.customOrderId || freshOrder._id.toString(),
            paymentMethod,
            subtotal: freshOrder.cartItems.reduce(
              (acc, item) => acc + item.price * item.quantity,
              0
            ),
            shippingCost: freshOrder.shippingCharge,
            discount: freshOrder.discount || 0,
            couponCode: freshOrder.couponCode || null,
            totalAmount: freshOrder.totalAmount,
            items: freshOrder.cartItems,
            shipping: freshOrder.deliveryType,
            address: {
              ...freshOrder.addressDetails,
              phone: freshOrder.phone,
            },
          };

          fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.ravenfragrance.in"}/api/send-confirmation-mail`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(emailPayload),
            }
          )
            .then(() => console.log("📨 Webhook: Email triggered successfully"))
            .catch((err) => console.error("📩 Webhook: Email trigger error:", err));

          await Order.findByIdAndUpdate(freshOrder._id, { emailSent: true });
        }
      } catch (mailErr) {
        console.error("❌ Webhook email error:", mailErr);
      }

      // Send WhatsApp confirmation
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
