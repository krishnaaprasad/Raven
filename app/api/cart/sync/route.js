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

    if (!items || !Array.isArray(items)) {
      return Response.json({ success: false, message: "Invalid cart items" });
    }

    // 🔍 Build query target based on login state
    const query = userId ? { userId } : sessionId ? { sessionId } : null;

    if (!query) {
      return Response.json({ success: false, message: "No user or guest session found" });
    }

//-----------------------------------------------------------
// 🔁 Normalize items (convert id -> productId for DB model)
//-----------------------------------------------------------
const normalizedItems = items.map((i) => ({
  productId: i.id || i.productId, // 👈 Fix missing field
  name: i.name,
  slug: i.slug,
  image: i.image,
  size: i.size,
  price: i.price,
  quantity: i.quantity,
}));

//-----------------------------------------------------------
// 📦 FIND EXISTING CART (registered or guest)
//-----------------------------------------------------------
let cart = await Cart.findOne(query);

if (!cart) {
  cart = await Cart.create({
    userId: userId || null,
    sessionId: sessionId || null,
    items: normalizedItems,
    updatedAt: new Date(),
  });
} else {
  cart.items = normalizedItems;
  cart.updatedAt = new Date();
  await cart.save();
}

return Response.json({ success: true, cart });


  } catch (e) {
    console.error("Cart sync error:", e);
    return Response.json({ success: false, message: e.message });
  }
}
