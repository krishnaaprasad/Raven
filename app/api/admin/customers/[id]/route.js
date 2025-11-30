import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { Order } from "@/models/Order";

export async function GET(req, context) {
  try {
    await connectToDatabase();

    const { id } = await context.params;
    const { searchParams } = new URL(req.url);

    const orderPage = Number(searchParams.get("orderPage") || "1");
    const orderLimit = Number(searchParams.get("orderLimit") || "10");
    const orderSearch = searchParams.get("orderSearch") || "";

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // 🔍 Build orders query: try by userId OR userEmail
    const ordersQuery = {
      $or: [
        { userId: id }, // if you stored userId
        { userEmail: user.email }, // if you stored userEmail
      ],
    };

    if (orderSearch) {
      ordersQuery.$and = [
        {
          $or: [
            { customOrderId: { $regex: orderSearch, $options: "i" } },
          ],
        },
      ];
    }

    const skip = (orderPage - 1) * orderLimit;

    const [orders, totalOrders] = await Promise.all([
      Order.find(ordersQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(orderLimit),
      Order.countDocuments(ordersQuery),
    ]);

    return NextResponse.json({
      success: true,
      user,
      orders,
      ordersMeta: {
        total: totalOrders,
        page: orderPage,
        pages: Math.ceil(totalOrders / orderLimit),
        limit: orderLimit,
      },
    });
  } catch (err) {
    console.error("Admin customer fetch error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
