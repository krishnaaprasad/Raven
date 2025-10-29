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

    // Try to find the user in DB
    let user = await User.findOne({ email: session.user.email });

    // 🟢 If Google user doesn’t exist yet (rare case), create them on the fly
    if (!user) {
      user = await User.create({
        name: session.user.name || "Unnamed User",
        email: session.user.email,
        password: null,
        phone: "",
        address: "",
      });
      console.log("🟢 Created user via get-user (Google fallback):", user.email);
    }

    // 🧩 Return consistent structure (even if some fields are empty)
    return NextResponse.json({
      user: {
        name: user.name || session.user.name || "",
        email: user.email || session.user.email,
        phone: user.phone || "",
        address: user.address || "",
      },
    });
  } catch (err) {
    console.error("❌ Error in get-user:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
