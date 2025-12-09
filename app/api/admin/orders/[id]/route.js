import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    const q = searchParams.get("q") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const orderStatus = searchParams.get("orderStatus") || "";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const query = {};

    if (q) {
      query.$or = [
        { customOrderId: { $regex: q, $options: "i" } },
        { userName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    if (paymentStatus) query.status = paymentStatus;
    if (orderStatus) query.order_status = orderStatus;
    if (from && to) query.createdAt = { $gte: new Date(from), $lte: new Date(to) };

    const orders = await Order.find(query)
      .populate("userId", "name email phone isGuest")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Order.countDocuments(query);

    return NextResponse.json({
      data: orders,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("❌ GET /api/admin/orders:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
