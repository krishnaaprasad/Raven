export const dynamic = "force-dynamic";

import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);

    const filter = {
      deleted: { $ne: true },
    };

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .select("slug name images rating reviewCount variants accords fragranceType isComingSoon createdAt")
      .lean();

    // Strip internal cost fields from variants (the field list above includes whole variants)
    const COST_FIELDS = ["oil_cost", "packaging_cost", "other_cost", "total_cost", "cost_items"];
    for (const p of products) {
      for (const v of p.variants || []) COST_FIELDS.forEach((f) => delete v[f]);
    }

    return Response.json(products);

  } catch (error) {
    console.error("Products fetch error:", error);
    return Response.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}