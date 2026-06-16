import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

export async function POST(req) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const code = typeof body?.code === "string" ? body.code.toUpperCase().trim() : null;
    const parsedCartTotal = Number.parseFloat(body?.cartTotal);
    const cartTotal = Number.isFinite(parsedCartTotal) ? parsedCartTotal : NaN;

    if (!code) {
      return NextResponse.json(
        { message: "Coupon code required" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(cartTotal) || cartTotal < 0) {
      return NextResponse.json(
        { message: "Invalid cart total" },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findOne({
      code,
      isActive: true,
      deleted: { $ne: true },
    });

    if (!coupon) {
      return NextResponse.json(
        { message: "Invalid coupon" },
        { status: 400 }
      );
    }

    // Expiry check (only when a valid date is present)
    const expiryDate = coupon.expiryDate ? new Date(coupon.expiryDate) : null;
    if (expiryDate && !Number.isNaN(expiryDate.getTime()) && new Date() > expiryDate) {
      return NextResponse.json(
        { message: "Coupon expired" },
        { status: 400 }
      );
    }

    // Usage limit check
    if (
      coupon.usageLimit &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return NextResponse.json(
        { message: "Coupon usage limit reached" },
        { status: 400 }
      );
    }

    // Minimum order check
    if (cartTotal < (coupon.minOrderAmount || 0)) {
      return NextResponse.json(
        {
          message: `Minimum order ₹${coupon.minOrderAmount} required`,
        },
        { status: 400 }
      );
    }

    // 🔢 Calculate discount
    let discount = 0;

    if (coupon.type === "PERCENT") {
      discount = (cartTotal * coupon.value) / 100;

      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = Math.min(Number(coupon.value) || 0, cartTotal);
    }

    // Prevent negative final total
    const finalTotal = Math.max(0, cartTotal - Math.min(discount, cartTotal));

    return NextResponse.json({
      success: true,
      discount: Number(discount.toFixed(2)),
      finalTotal: Number(finalTotal.toFixed(2)),
      code: coupon.code,
    });

  } catch (error) {
    console.error("Coupon validate error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}