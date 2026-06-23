import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, results: { orders: [], products: [], customers: [] } });
    }

    await connectToDatabase();

    const regex = new RegExp(q, "i");

    // Search orders by customOrderId, manualOrderId, userName, email, phone
    const orders = await Order.find({
      deleted: { $ne: true },
      $or: [
        { customOrderId: regex },
        { manualOrderId: regex },
        { userName: regex },
        { email: regex },
        { phone: regex },
      ],
    })
      .select("_id customOrderId manualOrderId userName email phone totalAmount order_status")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Search products by name, slug
    const products = await Product.find({
      deleted: { $ne: true },
      $or: [
        { name: regex },
        { slug: regex },
      ],
    })
      .select("_id name slug")
      .limit(5)
      .lean();

    // Search customers by name, email, phone
    const customers = await User.find({
      $or: [
        { name: regex },
        { email: regex },
        { phone: regex },
      ],
    })
      .select("_id name email phone")
      .limit(5)
      .lean();

    return NextResponse.json({
      success: true,
      results: { orders, products, customers },
    });
  } catch (err) {
    console.error("Admin search error:", err);
    return NextResponse.json({ success: false, error: "Search failed" }, { status: 500 });
  }
}
