// app/api/admin/orders/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "10"));

    const q = (searchParams.get("q") || "").trim();
    const paymentStatus = searchParams.get("paymentStatus") || null; // PAID/PENDING/FAILED/CANCELLED
    const orderStatus = searchParams.get("orderStatus") || null;
    const from = searchParams.get("from") || null;
    const to = searchParams.get("to") || null;

    const filter = {};

    // SEARCH
    if (q) {
      const re = new RegExp(
        q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );
      filter.$or = [
        { customOrderId: re },
        { userName: re },
        { email: re },
        { phone: re },
        { "cartItems.name": re },
      ];
    }

    // NEW PAYMENT STATUS FILTER (updated)
    if (paymentStatus) {
      filter.$or = [
        { payment_status: paymentStatus }, // new field
        { status: paymentStatus }, // legacy fallback (your old field)
      ];
    }

    // ORDER STATUS FILTER
    if (orderStatus) {
      filter.order_status = orderStatus;
    }

    // DATE RANGE
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(`${to}T23:59:59`);
    }

    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      data: orders,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("❌ GET /api/admin/orders error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
