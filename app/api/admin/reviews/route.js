import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Review from "@/models/Review";
import Product from "@/models/Product";

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Review.find({})
        .populate("productId", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({}),
    ]);

    return NextResponse.json({
      reviews: data,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Admin GET reviews error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
