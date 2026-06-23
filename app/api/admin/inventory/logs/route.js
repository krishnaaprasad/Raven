import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import StockLog from "@/models/StockLog";
import "@/models/Product"; // ensure Product model is registered for populate

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (productId) {
      filter.productId = productId;
    }

    const [logs, total] = await Promise.all([
      StockLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("productId", "name slug")
        .lean(),
      StockLog.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Stock logs error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
