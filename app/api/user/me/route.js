import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return new Response(JSON.stringify({ error: "Not logged in" }), { status: 401 });

    await connectToDatabase();
    
    // Find by ID, Phone, or Email
    let user = await User.findById(session.user.id);
    
    if (!user && session.user.phone) {
      user = await User.findOne({ phone: session.user.phone });
    }
    
    if (!user && session.user.email) {
      user = await User.findOne({ email: session.user.email });
    }

    if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (err) {
    console.error("Fetch user error:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch user" }), { status: 500 });
  }
}
