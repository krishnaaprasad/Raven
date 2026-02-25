import connectToDatabase from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

export async function GET() {
  await connectToDatabase();
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  return Response.json(coupons);
}

export async function POST(req) {
  await connectToDatabase();
  const body = await req.json();
  const coupon = await Coupon.create(body);
  return Response.json(coupon);
}