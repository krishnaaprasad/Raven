import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";   // all | active | banned
    const dateRange = searchParams.get("dateRange") || "all"; // all | 7 | 30 | 365

    const query = {};

    // 🔍 Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // ✅ Status filter based on isBanned
    if (status === "active") {
      query.isBanned = false;
    } else if (status === "banned") {
      query.isBanned = true;
    }

    // 📅 Registration date filter
    if (dateRange !== "all") {
      const now = new Date();
      let from = null;

      if (dateRange === "7") {
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (dateRange === "30") {
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else if (dateRange === "365") {
        from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      }

      if (from) {
        query.createdAt = { $gte: from };
      }
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    // 📊 Stats for cards
    const totalUsers = await User.countDocuments({});
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsers30 = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const activeToday = await User.countDocuments({
      lastLogin: { $gte: todayStart },
    });

    return NextResponse.json({
      success: true,
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
      stats: {
        totalUsers,
        newUsers30,
        activeToday,
      },
    });
  } catch (err) {
    console.error("Admin customers error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
