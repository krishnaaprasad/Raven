import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { sendWhatsAppTemplate } from "@/lib/notifications/whatsapp.service";
import { getDeliveryPayload } from "@/lib/notifications/templates.service";

// POST /api/admin/orders/[id]/send-whatsapp
// Manually triggers the delivery WhatsApp message for an order (bypasses sent flags).
// Use this for testing.
export async function POST(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const payload = getDeliveryPayload(order);

    console.log("🧪 Manual WhatsApp send for order:", id);
    console.log("📦 Payload:", JSON.stringify(payload, null, 2));

    const result = await sendWhatsAppTemplate({
      order,
      phone: order.phone,
      ...payload,
    });

    // Reset flags so automatic send can work later if needed
    if (result.ok && !result.loggedOnly) {
      await Order.findByIdAndUpdate(id, {
        deliveryMessageSent: true,
        deliveredWhatsappSent: true,
      });
    }

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
