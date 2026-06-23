"use client";

import {
  TrendingUp,
  ShoppingCart,
  IndianRupee,
  Users,
  Package,
  AlertTriangle,
} from "lucide-react";

export default function KpiCards({ stats }) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
      <KpiCard
        icon={<IndianRupee size={20} />}
        label="Revenue (MTD)"
        value={`₹${Number(stats.totalSales || 0).toLocaleString("en-IN")}`}
        change={`${stats.salesChange > 0 ? "+" : ""}${stats.salesChange}%`}
        positive={stats.salesChange >= 0}
        subtitle={`${stats.paidOrderCountMTD || 0} orders this month`}
      />

      <KpiCard
        icon={<ShoppingCart size={20} />}
        label="Orders Today"
        value={stats.newOrders}
        change={stats.ordersYesterday > 0 ? `${stats.ordersYesterday} yesterday` : ""}
        positive={stats.newOrders >= stats.ordersYesterday}
        subtitle={`${stats.pendingOrders || 0} pending fulfillment`}
      />

      <KpiCard
        icon={<TrendingUp size={20} />}
        label="Avg. Order Value"
        value={`₹${Number(stats.avgOrderValue || 0).toLocaleString("en-IN")}`}
        subtitle={`₹${Number(stats.allTimeRevenue || 0).toLocaleString("en-IN")} total revenue`}
      />

      <KpiCard
        icon={<Users size={20} />}
        label="Total Customers"
        value={stats.totalCustomers || 0}
        change={`+${stats.newCustomersThisMonth || 0} this month`}
        positive
        subtitle=""
      />

      <KpiCard
        icon={<Package size={20} />}
        label="Pending Orders"
        value={stats.pendingOrders || 0}
        subtitle="Processing / Shipped / Out for Delivery"
        warning={stats.pendingOrders > 10}
      />

      <KpiCard
        icon={<AlertTriangle size={20} />}
        label="Low Stock"
        value={stats.lowStockCount || 0}
        subtitle="Variants with ≤5 units"
        warning={stats.lowStockCount > 0}
      />
    </div>
  );
}

function KpiCard({ icon, label, value, change, positive, warning, subtitle }) {
  return (
    <div className={`rounded-xl border p-5 bg-white ${warning ? "border-red-200" : "border-[#e7e1cf]"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
          warning ? "bg-red-50 text-red-500" : "bg-[#fff9ee] text-[#b28c34]"
        }`}>
          {icon}
        </div>
        {change && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            positive ? "bg-green-50 text-green-600" : warning ? "bg-red-50 text-red-600" : "bg-red-50 text-red-600"
          }`}>
            {change}
          </span>
        )}
      </div>

      <p className="text-2xl font-bold text-[#1b180d]">{value}</p>
      <p className="text-xs text-[#9a864c] mt-0.5">{label}</p>

      {subtitle && (
        <p className="text-[11px] text-[#6b6654] mt-2">{subtitle}</p>
      )}
    </div>
  );
}
