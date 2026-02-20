import connectToDatabase from "@/lib/mongodb";
import Review from "@/models/Review";
import Product from "@/models/Product";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return Response.json(
        { message: "Product ID required" },
        { status: 400 }
      );
    }

    const reviews = await Review.find({
      productId,
      deleted: false,
      status: "ACTIVE",
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

    const body = await req.json();
    const { productId, name, rating, title, comment, images } = body;

    if (!productId || !name || !rating || !title || !comment) {
      return Response.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return Response.json(
        { message: "Invalid product ID" },
        { status: 400 }
      );
    }

    // ✅ Secure Verified Logic (Server Side)
    const session = await getServerSession(authOptions);

    const review = await Review.create({
      productId,
      name,
      rating,
      title,
      comment,
      images: images || [],
      isVerified: !!session, // Verified if logged in
    });

    // Recalculate rating
    const reviews = await Review.find({
      productId,
      deleted: false,
      status: "ACTIVE",
    });

    const avgRating =
      reviews.length > 0
        ? Number(
            (
              reviews.reduce((acc, r) => acc + r.rating, 0) /
              reviews.length
            ).toFixed(1)
          )
        : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      reviewCount: reviews.length,
    });

    return Response.json(review, { status: 201 });
  } catch (error) {
    console.error("POST /reviews error:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectToDatabase();

    const { reviewId } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return Response.json(
        { message: "Invalid review ID" },
        { status: 400 }
      );
    }

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    return Response.json(review, { status: 200 });
  } catch (error) {
    console.error("PATCH /reviews error:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
