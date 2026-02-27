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
      .select("slug name images rating reviewCount variants accords")
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