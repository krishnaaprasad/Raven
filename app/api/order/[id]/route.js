import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function GET(request, context) {
  try {
    const params = await context.params;
    const { id } = params;

    await connectToDatabase();

    const order = await Order.findById(id);
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
        customOrderId: order.customOrderId, // ✅ This is now included
        userName: order.userName,
        email: order.email,
        phone: order.phone,
        address: order.address,
        addressDetails: order.addressDetails,
        cartItems: order.cartItems,
        shippingCharge: order.shippingCharge,
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
