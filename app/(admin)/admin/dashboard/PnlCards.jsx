"use client";

import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Package,
  Wallet,
  Clock,
  Receipt,
  Target,
} from "lucide-react";

export default function PnlCards({ stats }) {
  const cards = [
    {
      label: "Revenue (MTD)",
      value: `₹${Number(stats.totalSales || 0).toLocaleString("en-IN")}`,
      icon: <IndianRupee size={18} />,
      subtitle: `${stats.paidOrderCountMTD || 0} orders`,
      change: stats.salesChange ? `${stats.salesChange > 0 ? "+" : ""}${stats.salesChange}%` : null,
      positive: stats.salesChange >= 0,
    },
    {
      label: "COGS",
      value: `₹${Number(stats.cogs || 0).toLocaleString("en-IN")}`,
      icon: <Package size={18} />,
      subtitle: "Cost of goods sold",
    },
    {
      label: "Gross Profit",
      value: `₹${Number(stats.grossProfit || 0).toLocaleString("en-IN")}`,
      icon: <TrendingUp size={18} />,
      subtitle: `${stats.grossMargin || 0}% margin`,
      positive: (stats.grossProfit || 0) >= 0,
      change: `${stats.grossMargin || 0}%`,
    },
    {
      label: "Net Profit",
      value: `₹${Number(stats.netProfit || 0).toLocaleString("en-IN")}`,
      icon: (stats.netProfit || 0) >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />,
      subtitle: `${stats.netMargin || 0}% margin`,
      positive: (stats.netProfit || 0) >= 0,
      change: `${stats.netMargin || 0}%`,
    },
  ];

  const cards2 = [
    {
      label: "Cash In",
      value: `₹${Number(stats.cashIn || 0).toLocaleString("en-IN")}`,
      icon: <Wallet size={18} />,
      subtitle: "Paid orders this month",
    },
    {
      label: "Pending Receivables",
      value: `₹${Number(stats.pendingReceivables || 0).toLocaleString("en-IN")}`,
      icon: <Clock size={18} />,
      subtitle: "Unpaid orders (all time)",
      warning: (stats.pendingReceivables || 0) > 0,
    },
    {
      label: "Expenses (MTD)",
      value: `₹${Number(stats.totalExpenses || 0).toLocaleString("en-IN")}`,
      icon: <Receipt size={18} />,
      subtitle: "This month",
    },
    {
      label: "Capital Recovery",
      value: `${stats.recoveryPercentage || 0}%`,
      icon: <Target size={18} />,
      subtitle: `₹${Number(stats.capitalInvested || 0).toLocaleString("en-IN")} invested`,
      positive: (stats.recoveryPercentage || 0) > 0,
      change: (stats.cumulativeNetProfit || 0) >= 0
        ? `+₹${Number(stats.cumulativeNetProfit || 0).toLocaleString("en-IN")}`
        : `-₹${Math.abs(stats.cumulativeNetProfit || 0).toLocaleString("en-IN")}`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <PnlCard key={i} {...card} />
        ))}
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {cards2.map((card, i) => (
          <PnlCard key={i} {...card} />
        ))}
      </div>
    </div>
  );
}

function PnlCard({ icon, label, value, change, positive, warning, subtitle }) {
  return (
    <div className={`rounded-xl border p-4 bg-white ${warning ? "border-red-200" : "border-[#e7e1cf]"}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          warning ? "bg-red-50 text-red-500" : "bg-[#fff9ee] text-[#b28c34]"
        }`}>
          {icon}
        </div>
        {change && (
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
            positive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
          }`}>
            {change}
          </span>
        )}
      </div>
      <p className="text-lg font-bold text-[#1b180d]">{value}</p>
      <p className="text-[11px] text-[#9a864c] mt-0.5">{label}</p>
      {subtitle && (
        <p className="text-[10px] text-[#6b6654] mt-1">{subtitle}</p>
      )}
    </div>
  );
}
