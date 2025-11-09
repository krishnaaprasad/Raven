// app/api/orders/route.js
import { authOptions } from "../auth/[...nextauth]/route";
import Order from "@/models/Order";
import connectToDatabase from "@/lib/mongodb"; // ✅ default import
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

export async function GET() {
  try {
    // 1. Connect to MongoDB
    await connectToDatabase();

    // 2. Get the current logged-in user session
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Fetch orders for this user
    const orders = await Order.find({ userEmail: session.user.email }).sort({ createdAt: -1 });

    // 4. Return orders (or empty array if none)
    return NextResponse.json({ orders: orders || [] });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
