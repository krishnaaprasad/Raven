"use client";

export default function MonthlyPnlTable({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-[#e7e1cf] p-5 bg-white">
        <h3 className="text-sm font-bold text-[#1b180d] mb-3">Monthly P&L Comparison</h3>
        <p className="text-xs text-[#6b6654]">No data available</p>
      </div>
    );
  }

  const rows = [
    { key: "revenue", label: "Revenue" },
    { key: "cogs", label: "COGS" },
    { key: "grossProfit", label: "Gross Profit" },
    { key: "totalExpenses", label: "Expenses" },
    { key: "netProfit", label: "Net Profit" },
    { key: "netMargin", label: "Net Margin %" },
  ];

  const monthLabels = [
    "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return (
    <div className="rounded-xl border border-[#e7e1cf] bg-white shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <h3 className="text-sm font-bold text-[#1b180d]">Monthly P&L Comparison</h3>
        <p className="text-[11px] text-[#6b6654] mt-0.5">Last 6 months performance</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#1b180d] text-white">
              <th className="text-left px-4 py-2.5 font-medium">Metric</th>
              {data.map((m) => (
                <th key={m.period} className="text-right px-3 py-2.5 font-medium">
                  {monthLabels[m.month]} {String(m.year).slice(2)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-[#e7e1cf]">
                <td className="px-4 py-2.5 font-medium text-[#1b180d]">{row.label}</td>
                {data.map((m) => {
                  const val = m[row.key] || 0;
                  const isPercentage = row.key === "netMargin";
                  const displayVal = isPercentage
                    ? `${val}%`
                    : `₹${Number(val).toLocaleString("en-IN")}`;
                  const isNeg = val < 0;
                  const isProfit = row.key === "grossProfit" || row.key === "netProfit" || row.key === "netMargin";

                  return (
                    <td
                      key={m.period}
                      className={`text-right px-3 py-2.5 font-medium ${
                        isProfit
                          ? isNeg
                            ? "text-red-600"
                            : "text-green-600"
                          : "text-[#1b180d]"
                      }`}
                    >
                      {displayVal}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
