import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q || q.length < 2) {
      return Response.json({ results: [] });
    }

    // Escape user input — raw regex lets anyone send patterns that hang the DB (ReDoS)
    const safe = q.slice(0, 50).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(safe, "i");

    const products = await Product.find({
      deleted: { $ne: true },
      $or: [
        { name: regex },
        { brand: regex },
        { slug: regex },
        { fragranceType: regex },
        { topNotes: regex },
        { heartNotes: regex },
        { baseNotes: regex },
      ],
    })
      .select("name slug brand images")
      .limit(8)
      .lean();

    return Response.json({ results: products });
  } catch (e) {
    console.error("Search API error:", e);
    return Response.json({ results: [] }, { status: 500 });
  }
}
