import Cart from "@/models/Cart";
import connectToDatabase from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    await connectToDatabase();
    const { items, sessionId } = await req.json();
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    const query = userId ? { userId } : { sessionId };
    let cart = await Cart.findOne(query);

    if (!cart) {
      cart = new Cart({ userId, sessionId, items });
    } else {
      cart.items = items;
      cart.updatedAt = new Date();
    }

    await cart.save();
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ success: false, message: e.message });
  }
}
