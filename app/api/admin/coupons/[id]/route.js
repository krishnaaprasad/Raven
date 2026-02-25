import connectToDatabase from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

// 🔹 GET single coupon
export async function GET(req, { params }) {
  try {
    await connectToDatabase();

    const coupon = await Coupon.findById(params.id);

    if (!coupon) {
      return Response.json(
        { error: "Coupon not found" },
        { status: 404 }
      );
    }

    return Response.json(coupon);
  } catch (error) {
    console.error("GET coupon error:", error);
    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

// 🔹 PATCH update coupon
export async function PATCH(req, { params }) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const updated = await Coupon.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    );

    return Response.json(updated);
  } catch (error) {
    console.error("PATCH coupon error:", error);
    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}