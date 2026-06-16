import connectToDatabase from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const body = await req.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid coupon data" }, { status: 400 });
    }

    const allowedFields = [
      "code",
      "type",
      "value",
      "minOrderAmount",
      "maxDiscount",
      "usageLimit",
      "expiryDate",
      "isActive",
      "deleted",
      "isSingleUsePerUser",
    ];

    const sanitizedData = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, field) && body[field] !== undefined) {
        sanitizedData[field] = body[field];
      }
    }

    if (!sanitizedData.code || !sanitizedData.type || sanitizedData.value === undefined || !sanitizedData.expiryDate) {
      return NextResponse.json({ error: "Missing required coupon fields" }, { status: 400 });
    }

    sanitizedData.code = String(sanitizedData.code).trim().toUpperCase();
    sanitizedData.type = String(sanitizedData.type).toUpperCase();
    sanitizedData.value = Number(sanitizedData.value);
    sanitizedData.minOrderAmount = sanitizedData.minOrderAmount === undefined ? 0 : Number(sanitizedData.minOrderAmount);
    sanitizedData.maxDiscount = sanitizedData.maxDiscount === undefined ? null : Number(sanitizedData.maxDiscount);
    sanitizedData.usageLimit = sanitizedData.usageLimit === undefined ? null : Number(sanitizedData.usageLimit);

    if (!/^[A-Z0-9_-]+$/.test(sanitizedData.code)) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
    }

    if (!['PERCENT', 'FLAT'].includes(sanitizedData.type)) {
      return NextResponse.json({ error: "Invalid coupon type" }, { status: 400 });
    }

    if (!Number.isFinite(sanitizedData.value) || sanitizedData.value <= 0 || sanitizedData.value > 100) {
      return NextResponse.json({ error: "Invalid coupon value" }, { status: 400 });
    }

    if (!Number.isFinite(sanitizedData.minOrderAmount) || sanitizedData.minOrderAmount < 0) {
      return NextResponse.json({ error: "Invalid minimum order amount" }, { status: 400 });
    }

    if (sanitizedData.maxDiscount !== null && (!Number.isFinite(sanitizedData.maxDiscount) || sanitizedData.maxDiscount < 0)) {
      return NextResponse.json({ error: "Invalid maximum discount" }, { status: 400 });
    }

    if (sanitizedData.usageLimit !== null && (!Number.isFinite(sanitizedData.usageLimit) || sanitizedData.usageLimit < 0)) {
      return NextResponse.json({ error: "Invalid usage limit" }, { status: 400 });
    }

    const coupon = await Coupon.create(sanitizedData);

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error("CREATE COUPON ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}