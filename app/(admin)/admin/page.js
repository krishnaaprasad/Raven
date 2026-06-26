"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PnlCards from "./dashboard/PnlCards";
import MonthlyPnlTable from "./dashboard/MonthlyPnlTable";
import SkuRevenueChart from "./dashboard/SkuRevenueChart";
import OverduePayments from "./dashboard/OverduePayments";
import RevenueChart from "./dashboard/RevenueChart";
import MarqueeManager from "./dashboard/MarqueeManager";
import {
  Plus,
  ShoppingCart,
  Package,
  AlertTriangle,
  TrendingUp,
  Box,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [monthlyPnl, setMonthlyPnl] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const [statsRes, pnlRes] = await Promise.all([
          fetch("/api/admin/dashboard-stats"),
          fetch("/api/admin/pnl/monthly"),
        ]);

        if (!statsRes.ok || !pnlRes.ok) {
          console.error("Dashboard API error:", { stats: statsRes.status, pnl: pnlRes.status });
          if (mounted) setLoading(false);
          return;
        }

        const [statsData, pnlData] = await Promise.all([
          statsRes.json(),
          pnlRes.json(),
        ]);

        if (mounted) {
          setStats(statsData);
          setMonthlyPnl(pnlData.data || []);
        }
      } catch (e) {
        console.error("Dashboard Load Failed:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => (mounted = false);
  }, []);

  if (loading || !stats) {
    return (
      <div className="min-h-[70vh]">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-[#eee] rounded" />
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-[#f5f1e6] rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-[#f5f1e6] rounded-xl" />
            ))}
          </div>
          <div className="h-72 bg-[#f5f1e6] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1b180d]">Business Overview</h1>
          <p className="text-sm text-[#6b6654]">
            P&L metrics, cash flow, and operational health at a glance.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/orders">
            <button className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium border border-[#e7e1cf] rounded-lg hover:bg-[#f5f1e6]">
              <ShoppingCart size={14} />
              Orders
            </button>
          </Link>
          <Link href="/admin/products/add">
            <button className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium bg-[#b28c34] text-white rounded-lg hover:bg-[#9a864c]">
              <Plus size={14} />
              Add Product
            </button>
          </Link>
        </div>
      </div>

      {/* P&L KPI Cards (2 rows) */}
      <PnlCards stats={stats} />

      {/* Missing Cost Warnings */}
      {stats.missingCostWarnings && stats.missingCostWarnings.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 flex items-start gap-2">
          <AlertTriangle size={16} className="text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-yellow-800">Missing cost data</p>
            <p className="text-[11px] text-yellow-700 mt-0.5">
              {stats.missingCostWarnings.join(", ")} — COGS may be inaccurate
            </p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Monthly P&L Table */}
          <MonthlyPnlTable data={monthlyPnl} />

          {/* Revenue by SKU */}
          <SkuRevenueChart data={stats.revenueBysku} />

          {/* Revenue Chart (existing) */}
          <RevenueChart />
        </div>

        {/* Right side (1 col) */}
        <aside className="space-y-6">
          {/* Overdue Payments */}
          <OverduePayments data={stats.overduePayments} />

          {/* Low Stock Alerts */}
          {stats.lowStockItems && stats.lowStockItems.length > 0 && (
            <div className="rounded-xl border border-[#e7e1cf] p-5 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Box size={16} className="text-[#b28c34]" />
                <h3 className="text-sm font-bold text-[#1b180d]">Low Stock Alerts</h3>
              </div>
              <div className="space-y-2">
                {stats.lowStockItems.slice(0, 8).map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-[#fcfbf8] border border-[#e7e1cf]">
                    <span className="text-xs text-[#1b180d]">
                      {item.name} ({item.size}ml)
                    </span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      item.stock === 0 ? "bg-red-50 text-red-600" : "bg-yellow-50 text-yellow-700"
                    }`}>
                      {item.stock} left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Units Sold */}
          <div className="rounded-xl border border-[#e7e1cf] p-5 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-[#b28c34]" />
              <h3 className="text-sm font-bold text-[#1b180d]">Units Sold</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2.5 rounded-lg bg-[#fcfbf8] border border-[#e7e1cf]">
                <p className="text-lg font-bold text-[#1b180d]">{stats.unitsSoldToday || 0}</p>
                <p className="text-[10px] text-[#6b6654]">Today</p>
              </div>
              <div className="text-center p-2.5 rounded-lg bg-[#fcfbf8] border border-[#e7e1cf]">
                <p className="text-lg font-bold text-[#1b180d]">{stats.unitsSoldWeek || 0}</p>
                <p className="text-[10px] text-[#6b6654]">This Week</p>
              </div>
              <div className="text-center p-2.5 rounded-lg bg-[#fcfbf8] border border-[#e7e1cf]">
                <p className="text-lg font-bold text-[#1b180d]">{stats.unitsSoldMonth || 0}</p>
                <p className="text-[10px] text-[#6b6654]">This Month</p>
              </div>
            </div>
            {stats.bestSellingSkuMonth && (
              <p className="text-[11px] text-[#6b6654] mt-3 text-center">
                Best seller: <span className="font-semibold text-[#1b180d]">{stats.bestSellingSkuMonth.name}</span> ({stats.bestSellingSkuMonth.units} units)
              </p>
            )}
          </div>

          {/* Marquee Manager (existing) */}
          <MarqueeManager />
        </aside>
      </div>
    </div>
  );
}
