import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function GET() {
  try {
    await connectToDatabase();

    const result = await Order.aggregate([
      {
        $match: {
          payment_status: "PAID",
          deleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          monthIndex: "$_id.month",
          revenue: 1,
          orders: 1,
        },
      },
      {
        $sort: {
          year: 1,
          monthIndex: 1,
        },
      },
    ]);

    return NextResponse.json({ data: result });
  } catch (err) {
    console.error("Revenue Monthly API Error:", err);
    return NextResponse.json(
      { error: "Failed to load monthly revenue" },
      { status: 500 }
    );
  }
}
