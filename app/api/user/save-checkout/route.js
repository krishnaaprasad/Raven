import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    // Phone comes from the OTP-verified session, never from the request body
    const session = await getServerSession(authOptions);
    const phone = session?.user?.phone;
    if (!phone) {
      return NextResponse.json({ error: "Verified phone number is required" }, { status: 401 });
    }

    const data = await req.json();
    const { email, firstName, lastName, address1, address2, city, state, pincode } = data;

    await connectToDatabase();

    const fullName = `${firstName || ''} ${lastName || ''}`.trim();
    let user = await User.findOne({ phone });

    if (user) {
      // Update existing user with new address details
      user.name = fullName || user.name;
      if (email && (!user.email || user.email.startsWith("phone-only+"))) {
        user.email = email; // replace placeholder email when the real email is supplied
      }
      user.address1 = address1 || user.address1;
      user.address2 = address2 || user.address2;
      user.city = city || user.city;
      user.state = state || user.state;
      user.pincode = pincode || user.pincode;

      await user.save();
    } else {
      await User.create({
        phone,
        phoneVerified: true,
        name: fullName || "User",
        email: email || undefined,
        address1,
        address2,
        city,
        state,
        pincode,
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error saving checkout user data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
