import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from "@/models/User";
import connectToDatabase from "@/lib/mongodb";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    // Phone is the OTP-verified login identity — it can't be changed here without verification
    const { name, email, address1, address2, city, state, pincode } = data;
    
    await connectToDatabase();

    const user = await User.findById(session.user.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Update fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) {
      const cleanEmail = String(email).trim().toLowerCase();
      if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
      }
      if (cleanEmail && cleanEmail !== user.email) {
        const taken = await User.findOne({ email: cleanEmail, _id: { $ne: user._id } });
        if (taken) return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }
      user.email = cleanEmail || user.email;
    }
    if (address1 !== undefined) user.address1 = address1;
    if (address2 !== undefined) user.address2 = address2;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (pincode !== undefined) user.pincode = pincode;

    await user.save();

    return NextResponse.json({
      message: "Account info updated successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address1: user.address1,
        address2: user.address2,
        city: user.city,
        state: user.state,
        pincode: user.pincode
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
