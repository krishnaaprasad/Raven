import connectToDatabase from "@/lib/mongodb";
import Review from "@/models/Review";
import Product from "@/models/Product";

export async function GET(req) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return Response.json({ message: "Product ID required" }, { status: 400 });
    }

    const reviews = await Review.find({
      productId,
      deleted: false
    }).sort({ createdAt: -1 });

    return Response.json(reviews, { status: 200 });
  } catch (error) {
    console.error("GET /reviews error:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const { productId, name, rating, comment } = await req.json();

    if (!productId || !name || !rating) {
      return Response.json({ message: "Missing required fields" }, { status: 400 });
    }

    const review = await Review.create({ productId, name, rating, comment });

    // 🔄 Update product’s average rating & count
    const reviews = await Review.find({ productId });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: Number(avgRating.toFixed(1)),
      reviewCount: reviews.length,
    });

    return Response.json(review, { status: 201 });
  } catch (error) {
    console.error("POST /reviews error:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
