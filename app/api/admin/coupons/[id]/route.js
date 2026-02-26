import connectToDatabase from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import { NextResponse } from "next/server";

export async function PATCH(req, context) {
  try {
    await connectToDatabase();

    const { id } = context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Coupon ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedCoupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
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