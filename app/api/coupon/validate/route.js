import connectToDatabase from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

export async function POST(req) {
  try {
    await connectToDatabase();

    const { code, cartTotal } = await req.json();

    if (!code) {
      return Response.json(
        { message: "Coupon code required" },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      deleted: { $ne: true }, // safety if you use soft delete
    });

    if (!coupon) {
      return Response.json(
        { message: "Invalid coupon" },
        { status: 400 }
      );
    }

    if (new Date() > coupon.expiryDate) {
      return Response.json(
        { message: "Coupon expired" },
        { status: 400 }
      );
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return Response.json(
        { message: "Coupon usage limit reached" },
        { status: 400 }
      );
    }

    if (cartTotal < (coupon.minOrderAmount || 0)) {
      return Response.json(
        {
          message: `Minimum order ₹${coupon.minOrderAmount} required`,
        },
        { status: 400 }
      );
    }

    // Calculate discount
    let discount = 0;

    if (coupon.type === "PERCENT") {
      discount = (cartTotal * coupon.value) / 100;

      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.value;
    }

    return Response.json({
      success: true,
      discount,
      finalTotal: cartTotal - discount,
      code: coupon.code,
    });

  } catch (error) {
    console.error("Coupon validate error:", error);
    return Response.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}