import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import BusinessConfig from "@/models/BusinessConfig";

// GET /api/admin/business-config
export async function GET() {
  try {
    await connectToDatabase();
    const configs = await BusinessConfig.find({}).lean();

    const result = {};
    configs.forEach((c) => {
      result[c.key] = c.value;
    });

    return NextResponse.json({ success: true, config: result });
  } catch (err) {
    console.error("BusinessConfig GET error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PATCH /api/admin/business-config
export async function PATCH(req) {
  try {
    await connectToDatabase();
    const { key, value } = await req.json();

    if (!key) {
      return NextResponse.json({ success: false, error: "Key is required" }, { status: 400 });
    }

    if (value === undefined || value === null) {
      return NextResponse.json({ success: false, error: "Value is required" }, { status: 400 });
    }

    const updated = await BusinessConfig.findOneAndUpdate(
      { key },
      { key, value },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, config: updated });
  } catch (err) {
    console.error("BusinessConfig PATCH error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
