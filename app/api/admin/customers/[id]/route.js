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

    const user = await User.findById(id).lean();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // 🟡 Try User orders
    const ordersQuery = {
      $or: [{ userId: id }, { email: user.email }],
    };

    if (orderSearch) {
      ordersQuery.$and = [
        {
          $or: [{ customOrderId: { $regex: orderSearch, $options: "i" } }],
        },
      ];
    }

    const skip = (orderPage - 1) * orderLimit;

    const [orders, totalOrders] = await Promise.all([
      Order.find(ordersQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(orderLimit)
        .lean(),
      Order.countDocuments(ordersQuery),
    ]);

    // 🔥 Get latest order address if exists
    const latestOrder = await Order.findOne({ userId: id })
      .sort({ createdAt: -1 })
      .lean();

    const fullAddress = latestOrder?.addressDetails
      ? `${latestOrder.addressDetails.address1}${
          latestOrder.addressDetails.address2
            ? ", " + latestOrder.addressDetails.address2
            : ""
        }, ${latestOrder.addressDetails.city}, ${
          latestOrder.addressDetails.state
        } ${latestOrder.addressDetails.pincode}`
      : user.address || "";

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        fullAddress,
        isGuest: user.isGuest || false, // 🟢 Important
      },
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
