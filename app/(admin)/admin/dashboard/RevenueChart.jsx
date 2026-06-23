"use client";

import { useEffect, useState, useCallback } from "react";
import { TrendingUp, ArrowLeft } from "lucide-react";

export default function RevenueChart() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [hover, setHover] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMonthly = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/revenue-monthly");
      const json = await res.json();

      const sorted = (json.data || []).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.monthIndex - b.monthIndex;
      });

      setMonthlyData(sorted);
    } catch (err) {
      console.error("Monthly revenue API error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMonthly();
  }, [loadMonthly]);

  async function loadDaily(monthIndex, year) {
    try {
      const res = await fetch(
        `/api/admin/revenue-stats?month=${monthIndex}&year=${year}`
      );
      const json = await res.json();
      setDailyData(json.data || []);
      setSelectedMonth({ monthIndex, year });
      setHover(null);
    } catch (err) {
      console.error("Daily stats error:", err);
    }
  }

  const maxMonthly = Math.max(...monthlyData.map((m) => m.revenue), 1);
  const maxDaily = Math.max(...dailyData.map((d) => d.revenue), 1);
  const barWidth = 600 / Math.max(monthlyData.length, 1);

  // Total for selected view
  const totalRevenue = selectedMonth
    ? dailyData.reduce((s, d) => s + d.revenue, 0)
    : monthlyData.reduce((s, m) => s + m.revenue, 0);
  const totalOrders = selectedMonth
    ? dailyData.reduce((s, d) => s + d.orders, 0)
    : monthlyData.reduce((s, m) => s + m.orders, 0);

  return (
    <div className="rounded-xl border border-[#e7e1cf] p-5 bg-white w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#fff9ee] flex items-center justify-center">
            <TrendingUp size={16} className="text-[#b28c34]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1b180d]">
              {selectedMonth
                ? `${monthName(selectedMonth.monthIndex)} ${selectedMonth.year}`
                : "Revenue Overview"}
            </h3>
            <p className="text-[11px] text-[#6b6654]">
              ₹{totalRevenue.toLocaleString("en-IN")} · {totalOrders} orders
            </p>
          </div>
        </div>

        {selectedMonth && (
          <button
            onClick={() => setSelectedMonth(null)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-[#e7e1cf] rounded-lg hover:bg-[#f5f1e6] transition"
          >
            <ArrowLeft size={12} />
            All Months
          </button>
        )}
      </div>

      {/* Chart area */}
      <div className="h-64 rounded-lg bg-[#fcfbf8] border border-[#e7e1cf] p-3 mt-3 relative overflow-visible">
        {loading ? (
          <div className="h-full flex items-center justify-center text-sm text-[#6b6654]">
            Loading chart...
          </div>
        ) : !selectedMonth ? (
          /* MONTHLY BAR CHART */
          <svg viewBox="0 0 600 240" className="w-full h-full overflow-visible">
            {monthlyData.map((m, i) => {
              const height = (m.revenue / maxMonthly) * 160;
              const barX = i * barWidth + 20;
              const barY = 190 - height;
              const isHovered = hover?.index === i;

              return (
                <g
                  key={i}
                  onClick={() => loadDaily(m.monthIndex, m.year)}
                  onMouseEnter={() => setHover({ index: i })}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: "pointer" }}
                >
                  <rect
                    x={barX}
                    y={barY}
                    width={Math.max(barWidth - 20, 12)}
                    height={height}
                    fill={isHovered ? "#9a864c" : "#b28c34"}
                    rx="4"
                    className="transition-all duration-150"
                  />

                  <text
                    x={barX + (barWidth - 20) / 2}
                    y={215}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#6b6654"
                  >
                    {`${monthShort(m.monthIndex)}`}
                  </text>

                  {isHovered && (
                    <foreignObject
                      x={Math.max(0, barX - 25)}
                      y={Math.max(0, barY - 52)}
                      width="110"
                      height="48"
                      style={{ overflow: "visible" }}
                    >
                      <div className="bg-[#1b180d] text-white text-[10px] p-2 rounded-md shadow-lg text-center leading-snug">
                        <div className="font-semibold">₹{m.revenue.toLocaleString("en-IN")}</div>
                        <div className="opacity-70">{m.orders} orders</div>
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })}
          </svg>
        ) : (
          /* DAILY LINE CHART */
          <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
            {dailyData.length > 1 && (
              <path
                d={generateLine(dailyData, maxDaily)}
                stroke="#b28c34"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {dailyData.map((d, i) => {
              const x = (560 / Math.max(dailyData.length - 1, 1)) * i + 20;
              const y = 170 - (d.revenue / maxDaily) * 140;
              const isHovered = hover?.index === i;

              return (
                <g
                  key={i}
                  onMouseEnter={() => setHover({ index: i })}
                  onMouseLeave={() => setHover(null)}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 6 : 4}
                    fill={isHovered ? "#1b180d" : "#b28c34"}
                    className="transition-all duration-150"
                  />

                  {isHovered && (
                    <foreignObject
                      x={Math.max(5, x - 55)}
                      y={Math.max(5, y - 55)}
                      width="120"
                      height="50"
                    >
                      <div className="bg-[#1b180d] text-white text-[10px] p-2 rounded-md shadow-lg text-center leading-snug">
                        <div className="font-semibold">₹{d.revenue.toLocaleString("en-IN")}</div>
                        <div className="opacity-70">{formatDate(d.date)} · {d.orders} orders</div>
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Hint */}
      {!selectedMonth && monthlyData.length > 0 && (
        <p className="text-[10px] text-[#9a864c] mt-2 text-center">
          Click any bar to see daily breakdown
        </p>
      )}
    </div>
  );
}

function generateLine(data, max) {
  return data
    .map((d, i) => {
      const x = (560 / Math.max(data.length - 1, 1)) * i + 20;
      const y = 170 - (d.revenue / max) * 140;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

function formatDate(str) {
  return new Date(str).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function monthName(num) {
  return ["", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"][num];
}

function monthShort(num) {
  return ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][num];
}
