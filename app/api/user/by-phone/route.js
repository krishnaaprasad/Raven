import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST() {
  try {
    // Only ever return the logged-in user's own details — never look up arbitrary phone numbers
    const session = await getServerSession(authOptions);
    const phone = session?.user?.phone;
    if (!phone) {
      return NextResponse.json({ exists: false });
    }

    await connectToDatabase();

    const user = await User.findOne({ phone }).lean();

    if (user) {
      const email = user.email?.startsWith("phone-only+") ? "" : user.email || "";
      return NextResponse.json({
        exists: true,
        email,
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
