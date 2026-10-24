// app/api/invoice/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { generateInvoice } from "@/lib/invoice/generateInvoice";
import { verifyInvoiceToken } from "@/lib/notifications/templates.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

// Shown instead of the invoice when the link has no valid token and the viewer isn't the owner
function loginRequiredPage() {
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice – Raven Fragrance</title></head>
<body style="font-family:system-ui,sans-serif;background:#fff;color:#111;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:24px">
<div style="max-width:420px;text-align:center">
<h1 style="font-size:22px;margin:0 0 12px">Please log in to view this invoice</h1>
<p style="color:#666;font-size:14px;line-height:1.5;margin:0 0 20px">For your privacy, invoices are only available to the customer who placed the order. Log in with the phone number used for this order, then open it from My Account → Orders.</p>
<a href="/my-account?tab=Orders" style="display:inline-block;background:#111;color:#fff;padding:12px 22px;text-decoration:none;font-size:13px;letter-spacing:.1em;text-transform:uppercase">Go to My Orders</a>
</div></body></html>`;
  return new NextResponse(html, { status: 401, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const token = searchParams.get("token");

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID missing" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const order = mongoose.isValidObjectId(orderId) ? await Order.findById(orderId) : null;

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Access: signed link (WhatsApp/email) OR the logged-in customer who owns the order OR an admin.
    // Previously anyone with an order id could download its invoice (name, phone, address).
    let allowed = Boolean(token) && verifyInvoiceToken(order, token);
    if (!allowed) {
      const session = await getServerSession(authOptions);
      const user = session?.user;
      allowed = Boolean(
        user &&
          (user.role === "ADMIN" ||
            (order.userId && String(order.userId) === String(user.id)) ||
            (user.phone && order.phone === user.phone))
      );
    }
    if (!allowed) return loginRequiredPage();

    // Guard against missing or invalid cartItems
    const cartItemsSafe = Array.isArray(order.cartItems) ? order.cartItems : [];

    const subtotal = cartItemsSafe.reduce(
      (s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 0),
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

      items: cartItemsSafe,

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
