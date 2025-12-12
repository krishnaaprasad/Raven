import connectToDatabase from "@/lib/mongodb";
import Review from "@/models/Review";
import Product from "@/models/Product";
import mongoose from "mongoose";

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

    console.log("🚨 Incoming Review ProductID:", productId);

    if (!productId || !name || !rating) {
      return Response.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.log("❌ INVALID PRODUCT ID:", productId);
      return Response.json({ message: "Invalid product ID" }, { status: 400 });
    }

    // ⭐ Create new review
    const review = await Review.create({
      productId,
      name,
      rating,
      comment
    });

    // ⭐ Use only ACTIVE + non-deleted reviews to calculate summary
    const reviews = await Review.find({
      productId,
      deleted: false,
      status: "ACTIVE"
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0;

    // ⭐ Update product's rating & review count
    await Product.findByIdAndUpdate(
  new mongoose.Types.ObjectId(productId),
  {
    rating: Number(avgRating.toFixed(1)),
    reviewCount: reviews.length,
  }
);


    return Response.json(review, { status: 201 });
  } catch (error) {
    console.error("POST /reviews error:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

