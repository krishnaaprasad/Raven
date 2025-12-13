import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function GET(req, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params; // ✅ FIX

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order ID missing" },
        { status: 400 }
      );
    }

    const order = await Order.findById(id)
      .populate("userId", "name email phone isGuest");

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("❌ GET /api/admin/orders/[id]:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params; // ✅ FIX

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order ID missing" },
        { status: 400 }
      );
    }

    const { order_status } = await req.json();

    if (!order_status) {
      return NextResponse.json(
        { success: false, error: "order_status required" },
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

    // ✅ Save history
    order.orderHistory.push({
      from: order.order_status,
      to: order_status,
      by: "admin",
      at: new Date(),
    });

    order.order_status = order_status;
    await order.save();

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("❌ PATCH /api/admin/orders/[id]:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
