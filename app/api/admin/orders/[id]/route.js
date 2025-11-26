// /app/api/admin/orders/[id]/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";

const FLOW = ["Payment Awaiting", "Processing", "Shipped", "Out for Delivery", "Delivered"];

function normalize(s) {
  if (!s) return s;
  if (s === "Canceled") return "Cancelled";
  return s;
}

function canTransition(current, next) {
  current = normalize(current);
  next = normalize(next);
  if (next === "Cancelled") return true;
  const curIdx = FLOW.indexOf(current);
  const nextIdx = FLOW.indexOf(next);
  if (curIdx === -1) return nextIdx >= 0;
  return nextIdx >= curIdx;
}

export async function PATCH(req, context) {
  try {
    const params = await context.params;   // FIX
    const { id } = params; // ✅ Correct way to read params

    const body = await req.json();
    const requested = body.order_status;

    if (!requested) {
      return NextResponse.json({ success: false, error: "Missing order_status" }, { status: 400 });
    }

    const next = normalize(requested);

    await connectToDatabase();
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    let current =
      order.order_status ||
      (order.payment_status === "PAID" ? "Processing" : "Payment Awaiting");

    if (!canTransition(current, next)) {
      return NextResponse.json(
        { success: false, error: `Invalid transition: ${current} → ${next}` },
        { status: 400 }
      );
    }

    const prev = current;

    // UPDATE STATUS
    order.order_status = next;

    // FIX PAYMENT_STATE CRASH HERE
    if (![
      "NOT_ATTEMPTED",
      "PENDING",
      "SUCCESS",
      "FAILED",
      "FLAGGED",
      "CANCELLED",
      "VOID",
      "USER_DROPPED"
    ].includes(order.payment_state)) {
      order.payment_state = "PENDING"; // 👈 fallback instead of crash
    }

    // CANCEL ORDER LOGIC
    if (next === "Cancelled" && order.payment_status !== "PAID") {
      order.payment_status = "CANCELLED";
    }

    // HISTORY LOG
    order.orderHistory = order.orderHistory || [];
    order.orderHistory.push({
      from: prev,
      to: next,
      by: "admin",
      at: new Date(),
      note: body.note || "",
    });

    await order.save(); // ⬅ will now NEVER crash

    // // EMAIL notify (unchanged)
    // fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-confirmation-mail`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     email: order.email,
    //     name: order.userName,
    //     phone: order.phone,   // ➤ add this
    //     address: order.address,   // if needed
    //     orderId: order.customOrderId || order._id.toString(),
    //     prevStatus: prev,
    //     newStatus: next,
    //     totalAmount: order.totalAmount,
    //     notifyType: "order-status-update",
    //   }),
    // }).catch(() => null);

    return NextResponse.json({ success: true, order });

  } catch (err) {
    console.error("PATCH admin order error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
