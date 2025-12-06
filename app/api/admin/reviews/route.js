import connectToDatabase from "@/lib/mongodb";
import Review from "@/models/Review";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectToDatabase();

    const data = await Review.find({})
      .populate("productId", "name slug")
      .sort({ createdAt: -1 });

    return Response.json(data, { status: 200 });
  } catch (err) {
    console.error("Admin GET reviews error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
