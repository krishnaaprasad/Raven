import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return new Response(JSON.stringify({ error: "Not authorized" }), { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, phone, address1, address2, city, state, pincode } = body;

    await connectToDatabase();

    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          name: fullName,
          phone,
          address1,
          address2,
          city,
          state,
          pincode,
        },
      },
      { new: true }
    );

    return new Response(JSON.stringify({ success: true, user: updatedUser }), { status: 200 });
  } catch (error) {
    console.error("Profile update error:", error);
    return new Response(JSON.stringify({ error: "Failed to update user profile" }), { status: 500 });
  }
}
