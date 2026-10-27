import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { istDayStart, istMonthStart, istMonthStartOf, istYearMonth, IST_TZ } from "@/lib/istDate";
import { Order } from "@/models/Order";
import Product from "@/models/Product";
import Expense from "@/models/Expense";

// GET /api/admin/pnl/monthly — returns last 6 months P&L
export async function GET() {
  try {
    await connectToDatabase();

    const now = new Date();
    const months = [];

    const cur = istYearMonth(now);
    for (let i = 5; i >= 0; i--) {
      const idx = cur.year * 12 + (cur.month - 1) - i; // months since year 0
      const year = Math.floor(idx / 12);
      const month = (idx % 12) + 1;
      months.push({
        year,
        month,
        period: `${year}-${String(month).padStart(2, "0")}`,
        startDate: istMonthStartOf(year, month),
        endDate: istMonthStartOf(year, month + 1),
      });
    }

    // Pre-load all product costs
    const products = await Product.find({ deleted: { $ne: true } }).select("slug variants").lean();
    const costMap = {};
    products.forEach((p) => {
      p.variants?.forEach((v) => {
        costMap[`${p.slug}:${v.size}`] = v.total_cost || 0;
      });
    });

    const results = [];

    for (const m of months) {
      // Revenue
      const revAgg = await Order.aggregate([
        {
          $match: {
            payment_status: "PAID",
            deleted: { $ne: true },
            createdAt: { $gte: m.startDate, $lt: m.endDate },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
      ]);
      const revenue = revAgg[0]?.total || 0;
      const orderCount = revAgg[0]?.count || 0;

      // COGS
      const orders = await Order.find({
        payment_status: "PAID",
        deleted: { $ne: true },
        createdAt: { $gte: m.startDate, $lt: m.endDate },
      }).select("cartItems").lean();

      let cogs = 0;
      let unitsSold = 0;

      for (const order of orders) {
        for (const item of order.cartItems || []) {
          unitsSold += item.quantity || 0;
          const unitCost = costMap[`${item.slug}:${item.size}`] || 0;
          cogs += unitCost * (item.quantity || 0);
        }
      }

      // Expenses
      const expAgg = await Expense.aggregate([
        {
          $match: {
            deleted: { $ne: true },
            date: { $gte: m.startDate, $lt: m.endDate },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      const totalExpenses = expAgg[0]?.total || 0;

      const grossProfit = revenue - cogs;
      const netProfit = grossProfit - totalExpenses;
      const grossMargin = revenue > 0 ? Math.round((grossProfit / revenue) * 1000) / 10 : 0;
      const netMargin = revenue > 0 ? Math.round((netProfit / revenue) * 1000) / 10 : 0;

      results.push({
        period: m.period,
        year: m.year,
        month: m.month,
        revenue,
        orderCount,
        unitsSold,
        cogs,
        grossProfit,
        grossMargin,
        totalExpenses,
        netProfit,
        netMargin,
      });
    }

    return NextResponse.json({ success: true, data: results });
  } catch (err) {
    console.error("Monthly P&L API error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
