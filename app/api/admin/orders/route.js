// app/api/admin/orders/route.js

import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import User from "@/models/User";


export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "10"));

    const q = (searchParams.get("q") || "").trim();
    const paymentStatus = searchParams.get("paymentStatus") || null;
    const orderStatus = searchParams.get("orderStatus") || null;
    const from = searchParams.get("from") || null;
    const to = searchParams.get("to") || null;
    const hasDiscount = searchParams.get("hasDiscount") || null;
    const couponCode = searchParams.get("couponCode") || null;

    const showDeleted = searchParams.get("deleted") === "true";

    const filter = showDeleted
      ? { deleted: true }
      : { deleted: { $ne: true } };


    // SEARCH
    if (q) {
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { customOrderId: re },
        { userName: re },
        { email: re },
        { phone: re },
        { "cartItems.name": re },
      ];
    }

    // PAYMENT STATUS
    if (paymentStatus) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { payment_status: paymentStatus },
          { status: paymentStatus },
        ],
      });
    }

    // ORDER STATUS
    if (orderStatus) filter.order_status = orderStatus;

    // DATE RANGE FILTER
if (from || to) {
  filter.createdAt = {};
  if (from) filter.createdAt.$gte = new Date(from);
  if (to) filter.createdAt.$lte = new Date(`${to}T23:59:59`);
}

// COUPON CODE FILTER
if (couponCode) {
  filter.couponCode = couponCode;
}

// DISCOUNT FILTER
if (hasDiscount === "yes") {
  filter.discount = { $gt: 0 };
}

if (hasDiscount === "no") {
  filter.$and = filter.$and || [];
  filter.$and.push({
    $or: [
      { discount: { $exists: false } },
      { discount: 0 },
      { discount: null },
    ],
  });
}

    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate({
        path: "userId",
        model: "User",
        select: "isGuest",
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();                                          // <-- safe

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
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
