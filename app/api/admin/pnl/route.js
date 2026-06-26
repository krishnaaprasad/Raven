import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import Product from "@/models/Product";
import Expense from "@/models/Expense";

// GET /api/admin/pnl?period=2026-06
export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const periodParam = searchParams.get("period");

    // Default to current month
    const now = new Date();
    let year, month;

    if (periodParam && /^\d{4}-\d{2}$/.test(periodParam)) {
      [year, month] = periodParam.split("-").map(Number);
    } else {
      year = now.getFullYear();
      month = now.getMonth() + 1;
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    const period = `${year}-${String(month).padStart(2, "0")}`;

    // 1. Revenue
    const revenueAgg = await Order.aggregate([
      {
        $match: {
          payment_status: "PAID",
          deleted: { $ne: true },
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]);
    const revenue = revenueAgg[0]?.total || 0;
    const orderCount = revenueAgg[0]?.count || 0;

    // 2. COGS — lookup product cost per item
    const orders = await Order.find({
      payment_status: "PAID",
      deleted: { $ne: true },
      createdAt: { $gte: startDate, $lt: endDate },
    }).select("cartItems").lean();

    let cogs = 0;
    let unitsSold = 0;
    const warnings = [];
    const productCostCache = {};

    for (const order of orders) {
      for (const item of order.cartItems || []) {
        unitsSold += item.quantity || 0;

        const cacheKey = `${item.slug}:${item.size}`;
        let unitCost = productCostCache[cacheKey];

        if (unitCost === undefined) {
          const product = await Product.findOne({ slug: item.slug }).select("variants name").lean();
          const variant = product?.variants?.find((v) => String(v.size) === String(item.size));
          unitCost = variant?.total_cost || 0;
          productCostCache[cacheKey] = unitCost;

          if (!unitCost && product) {
            const warning = `${product.name} (${item.size}ml) missing cost data`;
            if (!warnings.includes(warning)) warnings.push(warning);
          }
        }

        cogs += unitCost * (item.quantity || 0);
      }
    }

    // 3. Expenses
    const expenseAgg = await Expense.aggregate([
      {
        $match: {
          deleted: { $ne: true },
          date: { $gte: startDate, $lt: endDate },
        },
      },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
    ]);

    const expensesByCategory = {};
    let totalExpenses = 0;
    expenseAgg.forEach((e) => {
      expensesByCategory[e._id] = e.total;
      totalExpenses += e.total;
    });

    // 4. Calculate
    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - totalExpenses;
    const grossMargin = revenue > 0 ? Math.round((grossProfit / revenue) * 1000) / 10 : 0;
    const netMargin = revenue > 0 ? Math.round((netProfit / revenue) * 1000) / 10 : 0;

    return NextResponse.json({
      success: true,
      period,
      revenue,
      orderCount,
      unitsSold,
      cogs,
      grossProfit,
      grossMargin,
      totalExpenses,
      expensesByCategory,
      netProfit,
      netMargin,
      warnings,
    });
  } catch (err) {
    console.error("P&L API error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
