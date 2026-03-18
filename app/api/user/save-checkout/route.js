import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const data = await req.json();
    const { phone, email, firstName, lastName, address1, address2, city, state, pincode } = data;

    if (!phone) {
      return NextResponse.json({ error: "Verified phone number is required" }, { status: 400 });
    }

    await connectToDatabase();

    const fullName = `${firstName || ''} ${lastName || ''}`.trim();
    let user = await User.findOne({ phone });

    if (user) {
      // Update existing user with new address details
      user.name = fullName || user.name;
      if (email && !user.email) user.email = email; // only set if empty, don't overwrite
      user.address1 = address1 || user.address1;
      user.address2 = address2 || user.address2;
      user.city = city || user.city;
      user.state = state || user.state;
      user.pincode = pincode || user.pincode;
      
      await user.save();
      return NextResponse.json({ success: true, user });
    } else {
       // Create a new guest user profile using the phone and the filled form
      user = await User.create({
        phone,
        phoneVerified: true,
        name: fullName || "User",
        email: email || undefined,
        address1,
        address2,
        city,
        state,
        pincode,
        isGuest: true // Marks them as an un-authenticated guest account
      });
      return NextResponse.json({ success: true, user });
    }

  } catch (error) {
    console.error("Error saving checkout user data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
