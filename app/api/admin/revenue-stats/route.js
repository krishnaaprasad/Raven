// /app/api/admin/revenue-stats/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { istMonthStartOf, IST_TZ } from "@/lib/istDate";
import { Order } from "@/models/Order";

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const month = Number(searchParams.get("month"));
    const year = Number(searchParams.get("year"));

    if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year) || year < 2000 || year > 2100) {
      return NextResponse.json(
        { error: "Valid month (1-12) and year (2000-2100) params required" },
        { status: 400 }
      );
    }

    const startDate = istMonthStartOf(year, month);
    const endDate = new Date(istMonthStartOf(year, month + 1).getTime() - 1);

    const orders = await Order.aggregate([
      {
        $match: {
          payment_status: "PAID",   // FIXED
          deleted: { $ne: true },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: IST_TZ } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const map = {};
    orders.forEach((o) => (map[o._id] = o));

    const result = [];

    // One row per IST calendar day of the month
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      result.push({
        date: dateString,
        revenue: map[dateString]?.revenue || 0,
        orders: map[dateString]?.orders || 0,
      });

    }


    return NextResponse.json({ data: result });
  } catch (err) {
    console.error("Revenue Stats Error:", err);
    return NextResponse.json({ error: "Failed to load revenue stats" }, { status: 500 });
  }
}
