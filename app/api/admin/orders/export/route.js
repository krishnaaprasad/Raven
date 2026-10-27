import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { buildAdminOrderFilter } from "@/lib/adminOrderFilter";

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    // Same filter as the on-screen list (also excludes deleted orders, uses IST dates)
    const filter = buildAdminOrderFilter(searchParams);

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, data: orders });
  } catch (err) {
    console.error("CSV EXPORT ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
