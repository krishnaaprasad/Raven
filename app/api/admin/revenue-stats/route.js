import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const month = Number(searchParams.get("month"));
    const year = Number(searchParams.get("year")) || new Date().getFullYear();

    let start = new Date(year, month - 1, 1);
    let end = new Date(year, month, 1);

    const orders = await Order.aggregate([
      {
        $match: {
          status: "PAID",
          createdAt: { $gte: start, $lt: end }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const map = {};
    orders.forEach((o) => (map[o._id] = o.revenue));

    const result = [];
    for (let d = start; d < end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split("T")[0];
      result.push({
        date: key,
        revenue: map[key] || 0
      });
    }

    return NextResponse.json({ data: result }); // ⬅ FIXED

  } catch (err) {
    console.error("Daily Stats Error:", err);
    return NextResponse.json({ error: "Failed to load daily stats" }, { status: 500 });
  }
}
