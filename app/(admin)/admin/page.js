// app/admin/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import KpiCards from "./dashboard/KpiCards";
import RevenueChart from "./dashboard/RevenueChart";
import MarqueeManager from "./dashboard/MarqueeManager";
import {
  Plus,
  ShoppingCart,
  Package,
  Users,
  Star,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      try {
        const res = await fetch("/api/admin/dashboard-stats");
        const data = await res.json();
        if (mounted) setStats(data);
      } catch (e) {
        console.error("Stats Load Failed:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadStats();
    return () => (mounted = false);
  }, []);

  if (loading || !stats) {
    return (
      <div className="min-h-[70vh]">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 bg-[#eee] rounded" />
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-[#f5f1e6] rounded-xl" />
            ))}
          </div>
          <div className="h-72 bg-[#f5f1e6] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] space-y-6">
      {/* Welcome + Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1b180d]">Dashboard</h1>
          <p className="text-sm text-[#6b6654]">
            Here&apos;s what&apos;s happening with Raven Fragrance today.
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

      {/* KPI Cards */}
      <KpiCards stats={stats} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side (Chart + Order Status) */}
        <div className="lg:col-span-2 space-y-6">
          <RevenueChart />

          {/* Order Status Summary */}
          {stats.ordersByStatus && Object.keys(stats.ordersByStatus).length > 0 && (
            <div className="rounded-xl border border-[#e7e1cf] p-5 bg-white">
              <h3 className="text-base font-bold text-[#1b180d] mb-4">Order Status Overview</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center gap-3 p-3 rounded-lg bg-[#fcfbf8] border border-[#e7e1cf]">
                    <div className={`w-2.5 h-2.5 rounded-full ${getStatusDot(status)}`} />
                    <div>
                      <p className="text-lg font-bold text-[#1b180d]">{count}</p>
                      <p className="text-[11px] text-[#6b6654]">{status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right side widgets */}
        <aside className="space-y-6">
          <MarqueeManager />

          {/* Quick Links */}
          <div className="rounded-xl border border-[#e7e1cf] p-5 bg-white">
            <h4 className="text-sm font-bold text-[#1b180d] mb-3">Quick Links</h4>
            <div className="space-y-2">
              <QuickLink href="/admin/orders" icon={<ShoppingCart size={16} />} label="Manage Orders" />
              <QuickLink href="/admin/products" icon={<Package size={16} />} label="Manage Products" />
              <QuickLink href="/admin/customers" icon={<Users size={16} />} label="View Customers" />
              <QuickLink href="/admin/reviews" icon={<Star size={16} />} label="Manage Reviews" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function QuickLink({ href, icon, label }) {
  return (
    <Link href={href} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#f5f1e6] transition text-sm text-[#1b180d]">
      <span className="text-[#b28c34]">{icon}</span>
      {label}
    </Link>
  );
}

function getStatusDot(status) {
  switch (status) {
    case "Processing": return "bg-yellow-400";
    case "Shipped": return "bg-blue-400";
    case "Out for Delivery": return "bg-indigo-400";
    case "Delivered": return "bg-green-500";
    case "Cancelled": return "bg-red-400";
    default: return "bg-gray-400";
  }
}
