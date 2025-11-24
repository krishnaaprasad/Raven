import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function GET() {
  try {
    await connectToDatabase();

    // Create a date 30 days ago
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 29); // last 30 days

    // Fetch PAID orders from last 30 days
    const orders = await Order.aggregate([
      {
        $match: {
          status: "PAID",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Convert aggregation to a dictionary
    const map = {};
    orders.forEach((o) => {
      map[o._id] = o.revenue;
    });

    // Construct last 30-day range (even if no orders)
    const result = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      const key = d.toISOString().split("T")[0];
      result.push({
        date: key,
        revenue: map[key] || 0,
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Revenue Stats Error:", err);
    return NextResponse.json({ error: "Failed to load revenue stats" }, { status: 500 });
  }
}
