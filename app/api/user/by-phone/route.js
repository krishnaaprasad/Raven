import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ phone });

    if (user) {
      return NextResponse.json({
        exists: true,
        email: user.email || "",
        firstName: user.name?.split(" ")[0] || "",
        lastName: user.name?.split(" ").slice(1).join(" ") || "",
        address1: user.address1 || "",
        address2: user.address2 || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
      });
    }

    return NextResponse.json({ exists: false });

  } catch (error) {
    console.error("Error fetching user by phone:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
