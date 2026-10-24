import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request, context) {
  try {
    const params = await context.params;
    const { id } = params;

    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const order = mongoose.isValidObjectId(id) ? await Order.findById(id) : null;

    // Only the customer who placed the order (or an admin) may read it — it contains name, phone and address
    const isOwner =
      order &&
      ((order.userId && String(order.userId) === String(session.user.id)) ||
        (session.user.phone && order.phone === session.user.phone));
    if (order && !isOwner && session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        _id: order._id,
        customOrderId: order.customOrderId,
        userName: order.userName,
        email: order.email,
        phone: order.phone,
        address: order.address,
        addressDetails: order.addressDetails,
        cartItems: order.cartItems,

        shippingCharge: order.shippingCharge,
        deliveryType: order.deliveryType,

       // 🔥 IMPORTANT
        discount: Number(order.discount || 0),
        couponCode: order.couponCode || null,

        totalAmount: order.totalAmount,

        paymentMethod: order.paymentMethod,
        referenceId: order.referenceId,
        status: order.status,
        order_status: order.order_status,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching order:", error.message);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
