import connectToDatabase from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = Math.max(
      1,
      parseInt(searchParams.get("page") ?? "1", 10)
    );

    const limit = 50;

    const coupons = await Coupon.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json(coupons);
  } catch (error) {
    console.error("GET COUPONS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();

    const body = await req.json();

    const coupon = await Coupon.create(body);

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error("CREATE COUPON ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}