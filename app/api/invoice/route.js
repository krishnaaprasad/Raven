// app/api/invoice/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { generateInvoice } from "@/lib/invoice/generateInvoice";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID missing" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const subtotal = order.cartItems.reduce(
      (s, i) => s + i.price * i.quantity,
      0
    );

    const invoiceData = {
      orderId: order.customOrderId || order._id.toString(),
      transactionDate: order.transactionDate || order.createdAt,

      customer: {
        name: order.userName,
        email: order.email,
        phone: order.phone,
      },

      items: order.cartItems,

      subtotal,
      shipping: order.shippingCharge,

      // ✅ ADD THESE TWO
      discount: order.discount || 0,
      couponCode: order.couponCode || null,

      total: order.totalAmount,

      paymentMethod: order.paymentMethod,
      address: order.addressDetails,
    };

    const pdf = await generateInvoice(invoiceData);

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-${orderId}.pdf"`,
      },
    });
  } catch (err) {
    console.error("Invoice API Error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
