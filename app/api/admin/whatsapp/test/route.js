import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendWhatsAppTemplate } from "@/lib/notifications/whatsapp.service";
import { WHATSAPP_TEMPLATE_IDS } from "@/lib/notifications/templates.service";

const ALLOWED_TEST_TEMPLATES = new Set([
  "order_delivered",
  "review_request_new",
]);

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const templateName = body.templateName;

    if (!ALLOWED_TEST_TEMPLATES.has(templateName)) {
      return NextResponse.json({ success: false, error: "Invalid template" }, { status: 400 });
    }

    const result = await sendWhatsAppTemplate({
      phone: body.phone,
      templateId: body.templateId || WHATSAPP_TEMPLATE_IDS.ORDER_DELIVERED,
      templateName,
      bodyVariables: body.bodyVariables || {
        body_1: "Test Customer",
        body_2: "TEST20260622001 - Test Product",
        body_3: "999",
      },
      headerImageUrl: body.headerImageUrl || null,
      ctaVariables: body.ctaVariables || [],
    });

    return NextResponse.json({ success: result.ok, result });
  } catch (error) {
    console.error("Admin WhatsApp test failed:", error);
    return NextResponse.json({ success: false, error: error.message || "Test message failed" }, { status: 500 });
  }
}
