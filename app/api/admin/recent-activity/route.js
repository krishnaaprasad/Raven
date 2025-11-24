import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function GET() {
  try {
    await connectToDatabase();

    // Latest 10 orders sorted by createdAt descending
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const formatted = orders.map((o) => ({
      id: o.customOrderId || o._id.toString().slice(-6).toUpperCase(),
      name: o.userName,
      amount: o.totalAmount,
      status: o.order_status || o.status,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Recent Activity Error:", err);
    return NextResponse.json({ error: "Failed to load activity" }, { status: 500 });
  }
}
