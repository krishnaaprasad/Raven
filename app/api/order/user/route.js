import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const orders = await Order.find({ email: session.user.email })
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders });
  } catch (err) {
    console.error("Fetch user orders error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
