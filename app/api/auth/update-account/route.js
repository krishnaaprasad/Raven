import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from "@/models/User";
import connectToDatabase from "@/lib/mongodb";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, phone, address } = await req.json();
    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Update fields
    user.name = name;
    user.phone = phone;
    user.address = address;

    await user.save();

    return NextResponse.json({
      message: "Account info updated successfully",
      user: { name: user.name, email: user.email, phone: user.phone, address: user.address },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
