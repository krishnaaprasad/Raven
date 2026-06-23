import { NextResponse } from "next/server";
import axios from "axios";

// GET /api/admin/whatsapp/check-template?id=TEMPLATE_ID
// Fetches the parameter definitions for a template from Message Central
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get("id");

    if (!templateId) {
      return NextResponse.json({ error: "Missing template id" }, { status: 400 });
    }

    const apiKey = process.env.MESSAGE_CENTRAL_WA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const response = await axios.get(
      `https://whatsapp.messagecentral.com/whatsapp/api/v1/broadcasts/templates/${templateId}/parameter-definitions`,
      {
        headers: { "x-api-key": apiKey },
        timeout: 10000,
      }
    );

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.response?.data || error.message,
    }, { status: 500 });
  }
}
