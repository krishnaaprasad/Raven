import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { sendWhatsAppTemplate } from "@/lib/notifications/whatsapp.service";
import { getDeliveryPayload, getReviewPayload } from "@/lib/notifications/templates.service";

// POST /api/admin/orders/[id]/send-whatsapp
// Manually triggers WhatsApp messages for an order (bypasses sent flags).
// Body: { "type": "delivered" } or { "type": "review" }
// Default is "delivered" if no type specified.
export async function POST(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    let body = {};
    try { body = await req.json(); } catch (e) { /* empty body is fine */ }

    const type = body.type || "delivered";

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    let payload;
    if (type === "review") {
      const firstItem = order.cartItems?.[0];
      if (!firstItem) {
        return NextResponse.json({ success: false, error: "Order has no items" }, { status: 400 });
      }
      payload = getReviewPayload(order, firstItem);
      console.log("🧪 Manual WhatsApp REVIEW send for order:", id);
    } else {
      payload = getDeliveryPayload(order);
      console.log("🧪 Manual WhatsApp DELIVERED send for order:", id);
    }

    console.log("📦 Payload:", JSON.stringify(payload, null, 2));

    const result = await sendWhatsAppTemplate({
      order,
      phone: order.phone,
      ...payload,
    });

    return NextResponse.json({
      success: result.ok,
      loggedOnly: result.loggedOnly || false,
      result,
    });
  } catch (error) {
    console.error("❌ Manual WhatsApp send error:", error.response?.data || error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.response?.data || null,
      },
      { status: 500 }
    );
  }
}
