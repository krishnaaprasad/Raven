import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function GET() {
  try {
    await connectToDatabase();

    const orders = await Order.find({ deleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const formatted = orders.map((o) => ({
      id: o.customOrderId || o.manualOrderId || `#${o._id.toString().slice(-6).toUpperCase()}`,
      name: o.userName || "Guest",
      amount: o.totalAmount || 0,
      status: o.order_status || o.status || "Pending",
      date: o.createdAt,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Recent Activity Error:", err);
    return NextResponse.json({ error: "Failed to load activity" }, { status: 500 });
  }
}
