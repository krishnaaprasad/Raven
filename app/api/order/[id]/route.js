import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(request, context) {
  try {
    await connectToDatabase();

    // ✅ Await params properly
    const { id } = await context.params;

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("GET /api/order/[id] error:", error.message);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
