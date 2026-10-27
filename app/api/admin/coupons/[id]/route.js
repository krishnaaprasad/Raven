import connectToDatabase from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import { NextResponse } from "next/server";

/* ------------------ GET SINGLE COUPON ------------------ */
export async function GET(req, context) {
  try {
    await connectToDatabase();

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Coupon ID is required" },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findById(id).lean();

    if (!coupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("GET COUPON ERROR:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

/* ------------------ UPDATE COUPON ------------------ */
export async function PATCH(req, context) {
  try {
    await connectToDatabase();

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Coupon ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const allowedFields = ["type", "value", "minOrderAmount", "maxDiscount", "usageLimit", "expiryDate", "isActive"];

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid update payload" },
        { status: 400 }
      );
    }

    const update = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, field) && body[field] !== undefined) {
        update[field] = body[field];
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    // Percentage coupons can't exceed 100% (check against the type after this update)
    const current = await Coupon.findById(id).select("type value").lean();
    if (!current) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }
    const nextType = update.type ?? current.type;
    const nextValue = Number(update.value ?? current.value);
    if (nextType === "PERCENT" && nextValue > 100) {
      return NextResponse.json({ error: "Percentage coupons cannot exceed 100%" }, { status: 400 });
    }

    // Write only if type/value are still what we validated against (another edit in between
    // could otherwise combine into e.g. a 150% PERCENT coupon)
    const updatedCoupon = await Coupon.findOneAndUpdate(
      { _id: id, type: current.type, value: current.value },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!updatedCoupon) {
      return NextResponse.json(
        { error: "This coupon was changed by someone else just now. Reload and try again." },
        { status: 409 }
      );
    }

    return NextResponse.json(updatedCoupon);
  } catch (error) {
    console.error("PATCH COUPON ERROR:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}