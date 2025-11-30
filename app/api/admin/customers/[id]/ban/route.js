import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function PATCH(req, context) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const { ban } = await req.json(); // true = ban, false = unban

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    user.isBanned = !!ban;
    await user.save();

    return NextResponse.json({
      success: true,
      message: ban ? "User banned" : "User unbanned",
    });
  } catch (err) {
    console.error("Ban toggle error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
