import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { orderId, referenceId } = body;

    if (!orderId || !referenceId) {
      return NextResponse.json({ success: false, message: "Missing parameters" }, { status: 400 });
    }

    const updated = await Order.findByIdAndUpdate(
      orderId,
      {
        status: "PAID",
        referenceId,
        transactionDate: new Date(),
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err) {
    console.error("Mark paid error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
