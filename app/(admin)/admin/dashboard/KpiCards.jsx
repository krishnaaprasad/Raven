"use client";

export default function KpiCards({ stats }) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">

      {/* Total Sales */}
      <KpiCard
        label="Total Sales (MTD)"
        value={`₹${stats.totalSales.toLocaleString()}`}
        change="+5.2%"
        positive
      />

      {/* Orders Today */}
      <KpiCard
        label="New Orders Today"
        value={stats.newOrders}
        change="+1.5%"
        positive
      />

      {/* AOV */}
      <KpiCard
        label="Avg. Order Value"
        value={`₹${stats.avgOrderValue}`}
        change="-0.8%"
        positive={false}
      />
    </div>
  );
}

function KpiCard({ label, value, change, positive, warning }) {
  return (
    <div className="rounded-xl border border-[#e7e1cf] p-6 bg-white">
      <p className="text-sm text-[#9a864c]">{label}</p>

      <p className="mt-2 text-3xl font-serif text-[#1b180d]">{value}</p>

      <p
        className={`mt-1 text-sm flex items-center gap-1
        ${positive ? "text-green-600" : warning ? "text-red-600" : "text-red-600"}
      `}
      >
        {positive ? "▲" : warning ? "!" : "▼"} {change}
      </p>
    </div>
  );
}
