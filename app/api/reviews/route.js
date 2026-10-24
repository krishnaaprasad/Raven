import connectToDatabase from "@/lib/mongodb";
import Review from "@/models/Review";
import Product from "@/models/Product";
import { Order } from "@/models/Order";
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

    // Type-check first: non-string values would throw on .trim() (500) instead of a clean 400
    if (
      typeof productId !== "string" ||
      typeof name !== "string" || !name.trim() ||
      typeof title !== "string" || !title.trim() ||
      typeof comment !== "string" || !comment.trim()
    ) {
      return Response.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate rating
    const numericRating = Number(rating);
    if (
      !Number.isFinite(numericRating) ||
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return Response.json(
        { message: "Invalid rating" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return Response.json(
        { message: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Basic length limits (stops spam / giant payloads)
    if (String(name).length > 60 || String(title).length > 120 || String(comment).length > 2000) {
      return Response.json({ message: "Review is too long" }, { status: 400 });
    }

    // Check if product exists
    const product = await Product.findOne({ _id: productId, deleted: { $ne: true } })
      .select("slug")
      .lean();
    if (!product) {
      return Response.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // ✅ Secure Verified Logic (Server Side)
    const session = await getServerSession(authOptions);

    // Only accept our own Cloudinary uploads (max 5) — arbitrary URLs could embed any external image
    const cloudPrefix = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/`;
    const validImages = Array.isArray(images)
      ? images.filter((img) => typeof img === "string" && img.startsWith(cloudPrefix)).slice(0, 5)
      : [];

    // "Verified" = logged-in customer who actually has a paid order containing this product
    let isVerified = false;
    if (session?.user) {
      const ownerMatch = [];
      if (session.user.id && mongoose.Types.ObjectId.isValid(session.user.id)) {
        ownerMatch.push({ userId: session.user.id });
      }
      if (session.user.phone) ownerMatch.push({ phone: session.user.phone });
      if (ownerMatch.length) {
        isVerified = Boolean(
          await Order.exists({
            $or: ownerMatch,
            payment_status: "PAID",
            "cartItems.slug": product.slug,
          })
        );
      }
    }

    const review = await Review.create({
      productId,
      name: String(name).trim(),
      rating: numericRating,
      title: String(title).trim(),
      comment: String(comment).trim(),
      images: validImages,
      isVerified,
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

    if (!review) {
      return Response.json(
        { message: 'Review not found' },
        { status: 404 }
      );
    }
    return Response.json(review, { status: 200 });
  } catch (error) {
    console.error("PATCH /reviews error:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
