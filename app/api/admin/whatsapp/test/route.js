import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendWhatsAppTemplate } from "@/lib/notifications/whatsapp.service";

const ALLOWED_TEST_TEMPLATES = new Set([
  "order_confirmation",
  "order_delivered",
  "review_request",
  "repurchase_reminder",
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
      templateName,
      variables: Array.isArray(body.variables) ? body.variables : ["Test Customer", "TEST-ORDER", "999", "01 Jan 2026"],
      ctaVariables: Array.isArray(body.ctaVariables) ? body.ctaVariables : [],
    });

    return NextResponse.json({ success: result.ok, result });
  } catch (error) {
    console.error("Admin WhatsApp test failed:", error);
    return NextResponse.json({ success: false, error: "Test message failed" }, { status: 500 });
  }
}
