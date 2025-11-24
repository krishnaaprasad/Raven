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

export async function PATCH(req) {
  await connectToDatabase();
  const body = await req.json();

  const updated = await Marquee.findOneAndUpdate(
    {},
    {
      active: body.active,
      lines: body.lines,
    },
    { new: true, upsert: true }
  );

  return NextResponse.json(updated);
}
