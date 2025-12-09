// /app/api/admin/revenue-stats/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = new Date().getFullYear();

    if (!month) {
      return NextResponse.json({ error: "month param required" }, { status: 400 });
    }

    const m = Number(month);

    const startDate = new Date(year, m - 1, 1);
    const endDate = new Date(year, m, 0, 23, 59, 59); // last day of that month

    const orders = await Order.aggregate([
      {
        $match: {
          payment_status: "PAID",   // FIXED
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const map = {};
    orders.forEach((o) => (map[o._id] = o));

    const result = [];

    let d = new Date(startDate);
    while (d <= endDate) {
      const dateString = d.toISOString().split("T")[0];

      result.push({
        date: dateString,
        revenue: map[dateString]?.revenue || 0,
        orders: map[dateString]?.orders || 0,
      });

      // Create new instance so date never mutates wrong
      d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    }


    return NextResponse.json({ data: result });
  } catch (err) {
    console.error("Revenue Stats Error:", err);
    return NextResponse.json({ error: "Failed to load revenue stats" }, { status: 500 });
  }
}
