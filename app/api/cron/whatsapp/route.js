import crypto from "crypto";
import { NextResponse } from "next/server";
import { runWhatsAppDailyScheduler } from "@/lib/notifications/scheduler.service";

export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  const providedSecret = req.headers.get("x-cron-secret") || new URL(req.url).searchParams.get("secret");

  if (!secret || !providedSecret) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const storedSecret = Buffer.from(String(secret));
  const incomingSecret = Buffer.from(String(providedSecret));
  if (storedSecret.length !== incomingSecret.length || !crypto.timingSafeEqual(storedSecret, incomingSecret)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runWhatsAppDailyScheduler();
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("WhatsApp cron failed:", error);
    return NextResponse.json({ success: false, error: "Scheduler failed" }, { status: 500 });
  }
}
