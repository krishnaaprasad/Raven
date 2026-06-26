"use client";

export default function SkuRevenueChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-[#e7e1cf] p-5 bg-white">
        <h3 className="text-sm font-bold text-[#1b180d] mb-3">Revenue by SKU</h3>
        <p className="text-xs text-[#6b6654]">No sales data this month</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="rounded-xl border border-[#e7e1cf] p-5 bg-white shadow-sm">
      <h3 className="text-sm font-bold text-[#1b180d] mb-4">Revenue by SKU (This Month)</h3>
      <div className="space-y-3">
        {data.map((item, i) => {
          const widthPercent = (item.revenue / maxRevenue) * 100;
          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-[#1b180d]">{item.name}</span>
                <span className="text-xs text-[#6b6654]">
                  {item.units} units · ₹{Number(item.revenue).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="h-6 bg-[#f5f1e6] rounded-md overflow-hidden">
                <div
                  className="h-full bg-[#b28c34] rounded-md transition-all duration-500"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
