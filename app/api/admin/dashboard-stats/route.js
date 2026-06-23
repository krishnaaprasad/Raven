import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

export async function GET() {
  try {
    await connectToDatabase();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    // Previous month for comparison
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // ============================
    // 1️⃣ TOTAL SALES (MONTH-TO-DATE)
    // ============================
    const paidOrdersMTD = await Order.aggregate([
      {
        $match: {
          payment_status: "PAID",
          deleted: { $ne: true },
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]);

    const totalSalesMTD = paidOrdersMTD?.[0]?.total || 0;
    const paidOrderCountMTD = paidOrdersMTD?.[0]?.count || 0;

    // Previous month sales for comparison
    const paidOrdersPrev = await Order.aggregate([
      {
        $match: {
          payment_status: "PAID",
          deleted: { $ne: true },
          createdAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const prevMonthSales = paidOrdersPrev?.[0]?.total || 0;
    const salesChange = prevMonthSales > 0
      ? (((totalSalesMTD - prevMonthSales) / prevMonthSales) * 100).toFixed(1)
      : "0.0";

    // ============================
    // 2️⃣ NEW ORDERS TODAY
    // ============================
    const ordersToday = await Order.countDocuments({
      deleted: { $ne: true },
      createdAt: { $gte: startOfToday },
    });

    const ordersYesterday = await Order.countDocuments({
      deleted: { $ne: true },
      createdAt: { $gte: startOfYesterday, $lt: startOfToday },
    });

    // ============================
    // 3️⃣ AVERAGE ORDER VALUE
    // ============================
    const allPaidOrders = await Order.aggregate([
      { $match: { payment_status: "PAID", deleted: { $ne: true } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]);

    const avgOrderValue =
      allPaidOrders.length > 0 ? Math.round(allPaidOrders[0].total / allPaidOrders[0].count) : 0;

    // ============================
    // 4️⃣ PENDING ORDERS (not yet delivered)
    // ============================
    const pendingOrders = await Order.countDocuments({
      deleted: { $ne: true },
      payment_status: "PAID",
      order_status: { $in: ["Processing", "Shipped", "Out for Delivery"] },
    });

    // ============================
    // 5️⃣ TOTAL CUSTOMERS
    // ============================
    const totalCustomers = await User.countDocuments({});
    const newCustomersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // ============================
    // 6️⃣ LOW STOCK PRODUCTS
    // ============================
    const lowStockProducts = await Product.aggregate([
      { $match: { deleted: { $ne: true } } },
      { $unwind: "$variants" },
      { $match: { "variants.stock": { $lte: 5, $gte: 0 } } },
      { $count: "count" },
    ]);
    const lowStockCount = lowStockProducts?.[0]?.count || 0;

    // ============================
    // 7️⃣ TOTAL REVENUE (ALL TIME)
    // ============================
    const allTimeRevenue = allPaidOrders.length > 0 ? allPaidOrders[0].total : 0;
    const totalOrdersPaid = allPaidOrders.length > 0 ? allPaidOrders[0].count : 0;

    // ============================
    // 8️⃣ ORDERS BY STATUS (for pie/quick view)
    // ============================
    const ordersByStatus = await Order.aggregate([
      { $match: { deleted: { $ne: true }, payment_status: "PAID" } },
      { $group: { _id: "$order_status", count: { $sum: 1 } } },
    ]);

    const statusMap = {};
    ordersByStatus.forEach((s) => { statusMap[s._id] = s.count; });

    return NextResponse.json({
      totalSales: totalSalesMTD,
      salesChange: Number(salesChange),
      newOrders: ordersToday,
      ordersYesterday,
      avgOrderValue,
      pendingOrders,
      totalCustomers,
      newCustomersThisMonth,
      lowStockCount,
      allTimeRevenue,
      totalOrdersPaid,
      paidOrderCountMTD,
      ordersByStatus: statusMap,
    });
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    return NextResponse.json({ error: "Failed to load dashboard stats" }, { status: 500 });
  }
}
