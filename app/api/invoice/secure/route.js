import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { generateInvoice } from "@/lib/invoice/generateInvoice";
import { verifyInvoiceToken } from "@/lib/notifications/templates.service";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const token = searchParams.get("token");

    if (!orderId || !token) {
      return NextResponse.json({ success: false, message: "Invoice token missing" }, { status: 400 });
    }

    await connectToDatabase();
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    if (!verifyInvoiceToken(order, token)) {
      return NextResponse.json({ success: false, message: "Invalid invoice token" }, { status: 403 });
    }

    const cartItemsSafe = Array.isArray(order.cartItems) ? order.cartItems : [];
    const subtotal = cartItemsSafe.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
      0
    );

    const pdf = await generateInvoice({
      orderId: order.customOrderId || order._id.toString(),
      transactionDate: order.transactionDate || order.createdAt,
      customer: {
        name: order.userName,
        email: order.email,
        phone: order.phone,
      },
      items: cartItemsSafe,
      subtotal,
      shipping: order.shippingCharge,
      discount: order.discount || 0,
      couponCode: order.couponCode || null,
      total: order.totalAmount,
      paymentMethod: order.paymentMethod,
      address: order.addressDetails,
    });

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-${order.customOrderId || orderId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Secure invoice API error:", error);
    return NextResponse.json({ success: false, message: "Failed to generate invoice" }, { status: 500 });
  }
}
