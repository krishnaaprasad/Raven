import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function GET() {
  try {
    await connectToDatabase();

    const result = await Order.aggregate([
      {
        $match: {
          payment_status: "PAID",   // FIXED
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    const monthNames = [
      "",
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const formatted = result.map((r) => ({
      month: monthNames[r._id],
      revenue: r.revenue,
      orders: r.orders,
      monthIndex: r._id,
    }));

    return NextResponse.json({ data: formatted });
  } catch (err) {
    console.error("Revenue Monthly API Error:", err);
    return NextResponse.json({ error: "Failed to load monthly revenue" }, { status: 500 });
  }
}
