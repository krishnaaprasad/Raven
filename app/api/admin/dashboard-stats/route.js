import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
// If you have Products, import them later

export async function GET() {
  try {
    await connectToDatabase();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // ============================
    // 1️⃣ TOTAL SALES (MONTH-TO-DATE)
    // ============================
    const paidOrdersMTD = await Order.aggregate([
      {
        $match: {
          status: "PAID",
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);

    const totalSalesMTD = paidOrdersMTD?.[0]?.total || 0;

    // ============================
    // 2️⃣ NEW ORDERS TODAY
    // ============================
    const ordersToday = await Order.countDocuments({
      createdAt: { $gte: startOfToday }
    });

    // ============================
    // 3️⃣ AVERAGE ORDER VALUE
    // ============================
    const paidOrders = await Order.aggregate([
      { $match: { status: "PAID" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
    ]);

    const avgOrderValue =
      paidOrders.length > 0 ? Math.round(paidOrders[0].total / paidOrders[0].count) : 0;

    // ============================
    // 4️⃣ LOW STOCK (TEMP STATIC — WE UPDATE LATER)
    // ============================
    const lowStock = 8; // replace once Product model shared

    return NextResponse.json({
      totalSales: totalSalesMTD,
      newOrders: ordersToday,
      avgOrderValue: avgOrderValue,
      lowStock: lowStock,
    });

  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    return NextResponse.json({ error: "Failed to load dashboard stats" }, { status: 500 });
  }
}
