import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../authOptions"; // ✅ import from authOptions.js
import User from "@/models/User";
import connectToDatabase from "@/lib/mongodb";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { currentPassword, newPassword } = await req.json();
    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

    user.password = newPassword;
    await user.save();

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
