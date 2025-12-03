import Cart from "@/models/Cart";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "all";
    const dateRange = searchParams.get("dateRange") || "all";

    // === CREATE QUERY OBJECT ===
    const query = {};

    // Filter by type
    if (type === "guest") query.userId = null;
    if (type === "registered") query.userId = { $ne: null };

    // Filter by date range
    if (dateRange !== "all") {
      const days = parseInt(dateRange);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      query.updatedAt = { $gte: cutoff };
    }

    // Search matching name/email/session
    if (search) {
      query.$or = [
        { sessionId: { $regex: search, $options: "i" } },
      ];
    }

    // Fetch abandoned carts
const skip = (page - 1) * limit;
const carts = await Cart.find(query)
  .populate("userId", "name email")
  .sort({ updatedAt: -1 })
  .skip(skip)
  .limit(limit);

const total = await Cart.countDocuments(query);

// Stats
const guestCarts = await Cart.countDocuments({ userId: null });
const registeredCarts = await Cart.countDocuments({ userId: { $ne: null } });
const totalCarts = guestCarts + registeredCarts;
return Response.json({
  success: true,
  carts,
  total,
  pages: Math.ceil(total / limit),
  stats: { totalCarts, guestCarts, registeredCarts },
});
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
