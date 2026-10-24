import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import { PUBLIC_PRODUCT_FIELDS } from "@/lib/publicProduct";

export async function GET(request, context) {
  try {
    await connectToDatabase();

    // ✅ Await params first (IMPORTANT)
    const { slug } = await context.params;

    const product = await Product.findOne({
      slug,
      deleted: { $ne: true },
    })
      .select(PUBLIC_PRODUCT_FIELDS)
      .lean();

    if (!product) {
      return new Response(
        JSON.stringify({ message: "Product not found" }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(product), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return new Response(
      JSON.stringify({ message: "Server error" }),
      { status: 500 }
    );
  }
}
