import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Marquee from "@/models/Marquee";

export async function GET() {
  await connectToDatabase();

  let record = await Marquee.findOne();

  if (!record) {
    record = await Marquee.create({
      active: true,
      lines: ["FREE SHIPPING ON ORDERS ABOVE ₹1499!"],
    });
  }

  return NextResponse.json(record);
}
