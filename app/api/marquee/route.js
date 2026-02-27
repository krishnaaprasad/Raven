import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Marquee from "@/models/Marquee";

export const revalidate = 300; // cache 5 minutes

export async function GET() {
  await connectToDatabase();

  let record = await Marquee.findOne().lean();

  if (!record) {
    record = await Marquee.create({
      active: true,
      lines: [
        {
          text: "FREE SHIPPING ON ORDERS ABOVE ₹1499!",
          icon: "Sparkles",
          link: "",
        },
      ],
    });

    record = record.toObject();
  }

  return NextResponse.json(record);
}