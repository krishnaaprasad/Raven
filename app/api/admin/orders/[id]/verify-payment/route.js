import "@/models/User";
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import Coupon from "@/models/Coupon";
import { sendOrderConfirmation } from "@/lib/notifications/whatsapp.service";
import axios from "axios";

// POST /api/admin/orders/[id]/verify-payment
// Re-checks the order's payment status directly with Cashfree and
// reconciles the stored status. Useful when the customer paid but was
// never redirected back (so the verify route never ran).
export async function POST(req, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order ID missing" },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Cashfree GET /pg/orders/{order_id} accepts our merchant order id.
    const lookupId = order.customOrderId || order.cf_order_id;

    if (!lookupId) {
      return NextResponse.json(
        { success: false, error: "Order has no Cashfree identifier to verify" },
        { status: 400 }
      );
    }

    const isProduction =
      process.env.NEXT_PUBLIC_CASHFREE_ENV === "production";
    const baseUrl = isProduction
      ? "https://api.cashfree.com/pg/orders"
      : "https://sandbox.cashfree.com/pg/orders";

    const cfResponse = await axios.get(`${baseUrl}/${lookupId}`, {
      headers: {
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        "x-api-version": "2022-09-01",
      },
    });

    const cfData = cfResponse.data;
    const state = (cfData?.order_status || "").toUpperCase();

    // Map gateway status → business status
    let payment_state = state || "NOT_ATTEMPTED";
    let payment_status = "PENDING";
    let order_status = "Payment Awaiting";

    if (payment_state === "PAID" || payment_state === "SUCCESS") {
      payment_state = "SUCCESS";
      payment_status = "PAID";
      order_status = "Processing";
    } else if (["CANCELLED", "VOID"].includes(payment_state)) {
      payment_status = "CANCELLED";
      order_status = "Cancelled";
    } else if (payment_state === "PENDING" || payment_state === "NOT_ATTEMPTED") {
      payment_status = "PENDING";
    } else {
      payment_status = "FAILED";
      order_status = "Cancelled";
    }

    // Try to capture the payment method details when paid
    let paymentMethod = order.paymentMethod || "Cashfree";
    let paymentDetails = order.paymentDetails || {};

    if (payment_status === "PAID") {
      try {
        const paymentRes = await axios.get(
          `${baseUrl}/${lookupId}/payments`,
          {
            headers: {
              "x-client-id": process.env.CASHFREE_APP_ID,
              "x-client-secret": process.env.CASHFREE_SECRET_KEY,
              "x-api-version": "2022-09-01",
            },
          }
        );

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
        } else {
          paymentMethod = "Online Payment (Cashfree)";
          paymentDetails = { type: "OTHER" };
        }
      } catch (err) {
        console.warn("⚠️ Could not fetch payment details:", err.message);
      }
    }

    const referenceId =
      cfData.reference_id ||
      cfData.cf_order_id ||
      cfData.order_id ||
      order.referenceId ||
      "N/A";

    const wasFinalized =
      order.payment_status === "PAID" && order.verified === true;

    const updatePayload = {
      payment_state,
      payment_status,
      order_status:
        // don't move an already-advanced order back to "Processing"
        payment_status === "PAID" && order.order_status &&
        !["Payment Awaiting", "Cancelled"].includes(order.order_status)
          ? order.order_status
          : order_status,
      status: payment_status,
      referenceId,
      verified: payment_status === "PAID",
      paymentMethod: payment_status === "PAID" ? paymentMethod : order.paymentMethod,
      paymentDetails: payment_status === "PAID" ? paymentDetails : order.paymentDetails,
    };

    if (payment_status === "PAID") {
      updatePayload.transactionDate = order.transactionDate || new Date();
    }

    if (cfData?.cf_order_id && !order.cf_order_id) {
      updatePayload.cf_order_id = cfData.cf_order_id;
    }

    let updatedOrder = await Order.findByIdAndUpdate(id, updatePayload, {
      new: true,
    }).populate("userId", "name email phone isGuest");

    // Apply coupon usage once
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
            }
          );
        }
      } catch (couponErr) {
        console.error("❌ Reconcile coupon usage update error:", couponErr);
      }
    }

    // Send confirmation once if newly marked paid
    if (payment_status === "PAID" && !wasFinalized) {
      try {
        await sendOrderConfirmation(updatedOrder);
      } catch (whatsappErr) {
        console.error("❌ Reconcile WhatsApp confirmation error:", whatsappErr);
      }
    }

    return NextResponse.json({
      success: true,
      paid: payment_status === "PAID",
      payment_status,
      payment_state,
      order_status: updatePayload.order_status,
      order: updatedOrder,
      message:
        payment_status === "PAID"
          ? "Payment verified and order reconciled."
          : `Cashfree reports status: ${state || "UNKNOWN"}.`,
    });
  } catch (error) {
    console.error(
      "❌ Admin verify-payment error:",
      error.response?.data || error.message
    );
    return NextResponse.json(
      { success: false, error: "Failed to verify payment with Cashfree" },
      { status: 500 }
    );
  }
}
