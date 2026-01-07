export const dynamic = "force-dynamic";

import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit")) || 5;

    const products = await Product.find({ deleted: { $ne: true } })
      .sort({ createdAt: -1 }) // latest first
      .limit(limit)
      .select("slug name images rating reviewCount variants")
      .lean();

    return Response.json(products);
  } catch (error) {
    console.error("Products fetch error:", error);
    return Response.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
