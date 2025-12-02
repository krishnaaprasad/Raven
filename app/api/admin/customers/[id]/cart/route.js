import Cart from "@/models/Cart";
import connectToDatabase from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req, context) {
  await connectToDatabase();

  const { id } = await context.params; // must await

  try {
    const cart = await Cart.findOne({
      $or: [{ userId: id }, { sessionId: id }],
    });

    if (!cart) {
      return NextResponse.json({ success: true, cart: null });
    }

    return NextResponse.json({
      success: true,
      cart,
      mode: cart.userId ? "registered" : "guest",
      lastUpdated: cart.updatedAt,
    });
  } catch (err) {
    console.error("Cart fetch error:", err);
    return NextResponse.json({ success: false, message: err.message });
  }
}
