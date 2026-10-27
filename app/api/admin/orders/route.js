// app/api/admin/orders/route.js

import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import User from "@/models/User";
import { buildAdminOrderFilter } from "@/lib/adminOrderFilter";


export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "10"));

    const filter = buildAdminOrderFilter(searchParams);

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
