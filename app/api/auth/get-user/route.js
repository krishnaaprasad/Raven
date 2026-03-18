import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from "@/models/User";
import connectToDatabase from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();

    // Find the user by ID or Phone (from session)
    let user = await User.findById(session.user.id);

    if (!user && session.user.phone) {
        user = await User.findOne({ phone: session.user.phone });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address1: user.address1 || "",
        address2: user.address2 || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
        address: user.address || "", // Legacy
      },
    });
  } catch (err) {
    console.error("❌ Error in get-user:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
