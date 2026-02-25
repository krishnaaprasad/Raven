// app/api/admin/orders/[id]/send-mail/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function POST(req, context) {
  try {
    const { id } = await context.params; // 👈 Fix dynamic param usage

    await connectToDatabase();
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const subtotal = order.cartItems.reduce(
  (acc, item) => acc + item.price * item.quantity,
  0
);

const emailPayload = {
  email: order.email,
  name: order.userName,
  orderId: order.customOrderId || order._id.toString(),

  paymentMethod: order.paymentMethod || "Online Payment (Cashfree)",

  subtotal,
  shippingCost: order.shippingCharge,

  // ✅ ADD THESE TWO
  discount: order.discount || 0,
  couponCode: order.couponCode || null,

  totalAmount: order.totalAmount,

  items: order.cartItems,
  shipping: order.deliveryType,

  address: {
    ...order.addressDetails,
    phone: order.phone,
  },

  date: new Date(order.transactionDate || order.createdAt)
    .toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
};
    const baseURL =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    await fetch(`${baseURL}/api/send-confirmation-mail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailPayload),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Resend mail error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to send email" },
      { status: 500 }
    );
  }
}
