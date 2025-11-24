// app/admin/page.jsx
"use client";

import { useEffect, useState } from "react";
import KpiCards from "./dashboard/KpiCards";
import RevenueChart from "./dashboard/RevenueChart";
import MarqueeManager from "./dashboard/MarqueeManager";
import RecentActivity from "./dashboard/RecentActivity";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch KPI stats dynamically
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
      <div className="min-h-[70vh] p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 bg-[#eee] rounded" />
          <div className="h-40 bg-[#f8f8f8] rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh]">
      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left side (KPI + Chart) */}
        <div className="lg:col-span-2 space-y-6">
          <KpiCards stats={stats} />
          <RevenueChart />
        </div>

        {/* Right side widgets */}
        <aside className="space-y-6">
          <MarqueeManager />
          <RecentActivity />
        </aside>

      </div>
    </div>
  );
}
