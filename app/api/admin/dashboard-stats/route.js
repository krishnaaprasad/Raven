import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import Expense from "@/models/Expense";
import BusinessConfig from "@/models/BusinessConfig";

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

    // Week start (7 days ago)
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    // 30 days ago for overdue
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Pre-load all product costs and names
    const allProducts = await Product.find({ deleted: { $ne: true } })
      .select("slug name variants")
      .lean();
    const costMap = {};
    const nameMap = {};
    allProducts.forEach((p) => {
      nameMap[p.slug] = p.name;
      p.variants?.forEach((v) => {
        costMap[`${p.slug}:${v.size}`] = v.total_cost || 0;
      });
    });

    // ============================
    // PARALLEL QUERIES
    // ============================
    const [
      paidOrdersMTD,
      paidOrdersPrev,
      ordersToday,
      ordersYesterday,
      allPaidOrders,
      pendingOrdersCount,
      totalCustomers,
      newCustomersThisMonth,
      lowStockProducts,
      ordersByStatus,
      paidOrdersThisMonth,
      paidOrdersToday,
      paidOrdersWeek,
      expensesThisMonth,
      allTimeExpenses,
      pendingReceivablesAgg,
      overdueOrders,
      capitalConfig,
      allTimePaidOrders,
    ] = await Promise.all([
      // 1. Total sales MTD
      Order.aggregate([
        {
          $match: {
            payment_status: "PAID",
            deleted: { $ne: true },
            createdAt: { $gte: startOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
      ]),
      // 2. Previous month sales
      Order.aggregate([
        {
          $match: {
            payment_status: "PAID",
            deleted: { $ne: true },
            createdAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      // 3. Orders today
      Order.countDocuments({
        deleted: { $ne: true },
        createdAt: { $gte: startOfToday },
      }),
      // 4. Orders yesterday
      Order.countDocuments({
        deleted: { $ne: true },
        createdAt: { $gte: startOfYesterday, $lt: startOfToday },
      }),
      // 5. All paid orders (all time)
      Order.aggregate([
        { $match: { payment_status: "PAID", deleted: { $ne: true } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
      ]),
      // 6. Pending orders
      Order.countDocuments({
        deleted: { $ne: true },
        payment_status: "PAID",
        order_status: { $in: ["Processing", "Shipped", "Out for Delivery"] },
      }),
      // 7. Total customers
      User.countDocuments({}),
      // 8. New customers this month
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      // 9. Low stock count
      Product.aggregate([
        { $match: { deleted: { $ne: true } } },
        { $unwind: "$variants" },
        { $match: { "variants.stock": { $lte: 5, $gte: 0 } } },
        { $count: "count" },
      ]),
      // 10. Orders by status
      Order.aggregate([
        { $match: { deleted: { $ne: true }, payment_status: "PAID" } },
        { $group: { _id: "$order_status", count: { $sum: 1 } } },
      ]),
      // 11. Paid orders this month (for COGS/SKU)
      Order.find({
        payment_status: "PAID",
        deleted: { $ne: true },
        createdAt: { $gte: startOfMonth },
      }).select("cartItems createdAt").lean(),
      // 12. Paid orders today (for units sold today)
      Order.find({
        payment_status: "PAID",
        deleted: { $ne: true },
        createdAt: { $gte: startOfToday },
      }).select("cartItems").lean(),
      // 13. Paid orders this week (for units sold week)
      Order.find({
        payment_status: "PAID",
        deleted: { $ne: true },
        createdAt: { $gte: startOfWeek },
      }).select("cartItems").lean(),
      // 14. Expenses this month
      Expense.aggregate([
        {
          $match: {
            deleted: { $ne: true },
            date: { $gte: startOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      // 15. All time expenses
      Expense.aggregate([
        { $match: { deleted: { $ne: true } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      // 16. Pending receivables
      Order.aggregate([
        {
          $match: {
            payment_status: "PENDING",
            deleted: { $ne: true },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      // 17. Overdue orders (pending > 30 days)
      Order.find({
        payment_status: "PENDING",
        deleted: { $ne: true },
        createdAt: { $lt: thirtyDaysAgo },
      })
        .select("customOrderId userName totalAmount createdAt")
        .sort({ createdAt: 1 })
        .limit(5)
        .lean(),
      // 18. Capital invested config
      BusinessConfig.findOne({ key: "capital_invested" }).lean(),
      // 19. All time paid orders for cumulative calc
      Order.find({
        payment_status: "PAID",
        deleted: { $ne: true },
      }).select("cartItems").lean(),
    ]);

    // ============================
    // EXISTING CALCULATIONS
    // ============================
    const totalSalesMTD = paidOrdersMTD?.[0]?.total || 0;
    const paidOrderCountMTD = paidOrdersMTD?.[0]?.count || 0;

    const prevMonthSales = paidOrdersPrev?.[0]?.total || 0;
    const salesChange = prevMonthSales > 0
      ? (((totalSalesMTD - prevMonthSales) / prevMonthSales) * 100).toFixed(1)
      : "0.0";

    const avgOrderValue =
      allPaidOrders.length > 0 ? Math.round(allPaidOrders[0].total / allPaidOrders[0].count) : 0;

    const lowStockCount = lowStockProducts?.[0]?.count || 0;
    const allTimeRevenue = allPaidOrders.length > 0 ? allPaidOrders[0].total : 0;
    const totalOrdersPaid = allPaidOrders.length > 0 ? allPaidOrders[0].count : 0;

    const statusMap = {};
    ordersByStatus.forEach((s) => { statusMap[s._id] = s.count; });

    // ============================
    // NEW: COGS CALCULATION (this month)
    // ============================
    let cogs = 0;
    const skuMap = {}; // slug -> { name, units, revenue }

    for (const order of paidOrdersThisMonth) {
      for (const item of order.cartItems || []) {
        const unitCost = costMap[`${item.slug}:${item.size}`] || 0;
        cogs += unitCost * (item.quantity || 0);

        // Track SKU revenue
        const slug = item.slug || "unknown";
        if (!skuMap[slug]) {
          skuMap[slug] = { name: nameMap[slug] || item.name || slug, units: 0, revenue: 0 };
        }
        skuMap[slug].units += item.quantity || 0;
        skuMap[slug].revenue += (item.price || 0) * (item.quantity || 0);
      }
    }

    const grossProfit = totalSalesMTD - cogs;
    const grossMargin = totalSalesMTD > 0
      ? Math.round((grossProfit / totalSalesMTD) * 1000) / 10
      : 0;

    const totalExpenses = expensesThisMonth?.[0]?.total || 0;
    const netProfit = grossProfit - totalExpenses;
    const netMargin = totalSalesMTD > 0
      ? Math.round((netProfit / totalSalesMTD) * 1000) / 10
      : 0;

    // ============================
    // NEW: CASH FLOW
    // ============================
    const cashIn = totalSalesMTD;
    const pendingReceivables = pendingReceivablesAgg?.[0]?.total || 0;
    const netCashFlow = cashIn - totalExpenses;

    // ============================
    // NEW: CAPITAL RECOVERY
    // ============================
    const capitalInvested = capitalConfig?.value || 143450;

    // Cumulative net profit (all-time revenue - all-time COGS - all-time expenses)
    let allTimeCogs = 0;
    for (const order of allTimePaidOrders) {
      for (const item of order.cartItems || []) {
        const unitCost = costMap[`${item.slug}:${item.size}`] || 0;
        allTimeCogs += unitCost * (item.quantity || 0);
      }
    }
    const allTimeExpensesTotal = allTimeExpenses?.[0]?.total || 0;
    const cumulativeNetProfit = allTimeRevenue - allTimeCogs - allTimeExpensesTotal;
    const recoveryPercentage = capitalInvested > 0
      ? Math.round((cumulativeNetProfit / capitalInvested) * 1000) / 10
      : 0;

    // ============================
    // NEW: UNITS SOLD
    // ============================
    let unitsSoldToday = 0;
    for (const order of paidOrdersToday) {
      for (const item of order.cartItems || []) {
        unitsSoldToday += item.quantity || 0;
      }
    }

    let unitsSoldWeek = 0;
    for (const order of paidOrdersWeek) {
      for (const item of order.cartItems || []) {
        unitsSoldWeek += item.quantity || 0;
      }
    }

    let unitsSoldMonth = 0;
    for (const order of paidOrdersThisMonth) {
      for (const item of order.cartItems || []) {
        unitsSoldMonth += item.quantity || 0;
      }
    }

    // ============================
    // NEW: BEST SELLING SKU & REVENUE BY SKU
    // ============================
    const revenueBysku = Object.values(skuMap).sort((a, b) => b.revenue - a.revenue);
    const bestSellingSkuMonth = revenueBysku.length > 0
      ? { name: revenueBysku[0].name, units: revenueBysku[0].units }
      : null;

    // ============================
    // NEW: OVERDUE PAYMENTS
    // ============================
    const overduePayments = overdueOrders.map((o) => {
      const daysOverdue = Math.floor((now - new Date(o.createdAt)) / (1000 * 60 * 60 * 24));
      return {
        orderId: o.customOrderId || o._id.toString(),
        customer: o.userName,
        amount: o.totalAmount,
        daysOverdue,
      };
    });

    // ============================
    // NEW: LOW STOCK ITEMS
    // ============================
    const lowStockItems = [];
    for (const p of allProducts) {
      for (const v of p.variants || []) {
        if (v.stock >= 0 && v.stock <= 5) {
          lowStockItems.push({ name: p.name, size: v.size, stock: v.stock });
        }
      }
    }

    // ============================
    // NEW: MISSING COST WARNINGS
    // ============================
    const missingCostWarnings = [];
    for (const p of allProducts) {
      const hasMissingCost = p.variants?.some((v) => !v.total_cost || v.total_cost === 0);
      if (hasMissingCost) {
        missingCostWarnings.push(p.name);
      }
    }

    return NextResponse.json({
      // Existing fields
      totalSales: totalSalesMTD,
      salesChange: Number(salesChange),
      newOrders: ordersToday,
      ordersYesterday,
      avgOrderValue,
      pendingOrders: pendingOrdersCount,
      totalCustomers,
      newCustomersThisMonth,
      lowStockCount,
      allTimeRevenue,
      totalOrdersPaid,
      paidOrderCountMTD,
      ordersByStatus: statusMap,

      // NEW P&L fields
      cogs,
      grossProfit,
      grossMargin,
      totalExpenses,
      netProfit,
      netMargin,

      // Cash flow
      cashIn,
      pendingReceivables,
      netCashFlow,

      // Capital
      capitalInvested,
      cumulativeNetProfit,
      recoveryPercentage,

      // Units & SKU
      unitsSoldToday,
      unitsSoldWeek,
      unitsSoldMonth,
      bestSellingSkuMonth,
      revenueBysku,

      // Overdue
      overduePayments,

      // Low stock details
      lowStockItems,

      // Missing cost warnings
      missingCostWarnings,
    });
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    return NextResponse.json({ error: "Failed to load dashboard stats" }, { status: 500 });
  }
}
