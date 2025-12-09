"use client";

import { useEffect, useState } from "react";

export default function RevenueChart() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    loadMonthly();
  }, []);

  async function loadMonthly() {
    try {
      const res = await fetch("/api/admin/revenue-monthly");
      const json = await res.json();
      setMonthlyData(json);
    } catch (err) {
      console.error("Monthly revenue API error:", err);
    }
  }

  async function loadDaily(monthIndex, year) {
    try {
      const res = await fetch(`/api/admin/revenue-stats?month=${monthIndex}&year=${year}`);
      const json = await res.json();
      setDailyData(json.data);
      setSelectedMonth({ monthIndex, year });
    } catch (err) {
      console.error("Daily stats error:", err);
    }
  }

  const maxMonthly = Math.max(...monthlyData.map((m) => m.revenue), 1);
  const maxDaily = Math.max(...dailyData.map((d) => d.revenue), 1);
  const barWidth = 600 / Math.max(monthlyData.length, 1);

  return (
    <div className="rounded-xl border border-[#e7e1cf] p-6 bg-[#fcfbf8] w-full">
      <div className="flex justify-between items-center mb-4">
        <p className="text-lg font-serif text-[#1b180d]">
          {selectedMonth
            ? `Revenue for ${monthName(selectedMonth.monthIndex)}`
            : "Revenue by Month"}
        </p>

        {selectedMonth && (
          <button
            onClick={() => setSelectedMonth(null)}
            className="px-3 py-1 text-sm rounded-md bg-[#b28c34] text-white hover:bg-[#9a864c] transition"
          >
            Back to Months
          </button>
        )}
      </div>

      {/* ===================== CHART ===================== */}
      <div className="h-72 rounded-lg border border-[#e7e1cf] bg-white p-4 relative overflow-visible">

        {/* -------------------- MONTHLY BAR CHART -------------------- */}
        {!selectedMonth && (
          <svg viewBox="0 0 600 260" className="w-full h-full overflow-visible">
            {monthlyData.map((m, i) => {
              const height = (m.revenue / maxMonthly) * 170;
              return (
                <g
                  key={i}
                  onClick={() => loadDaily(m.monthIndex, m.year)}
                  onMouseEnter={() => setHover({ index: i, type: "month" })}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: "pointer" }}
                >
                  <rect
                    x={i * barWidth + 25}
                    y={200 - height}
                    width={barWidth - 25}
                    height={height}
                    fill="#b28c34"
                    rx="6"
                  />

                  <text
                    x={i * barWidth + barWidth / 2}
                    y={225}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#6b6654"
                  >
                    {(m.month || "").substring(0, 3)}
                  </text>

                  {/* Tooltip */}
                  {hover?.index === i && (
                    <foreignObject
                      x={i * barWidth + barWidth / 2 - 70}
                      y={200 - height - 70}
                      width="140"
                      height="60"
                    >
                      <div className="bg-[#1b180d] text-white text-center p-2 rounded-md shadow-xl text-[11px]">
                        <div>₹{m.revenue.toLocaleString()}</div>
                        <div>{m.orders} orders</div>
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })}
          </svg>
        )}

        {/* -------------------- DAILY LINE CHART -------------------- */}
        {selectedMonth && (
          <svg viewBox="0 0 600 260" className="w-full h-full overflow-visible">
            <path
              d={generateLine(dailyData, maxDaily)}
              stroke="#b28c34"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />

            {dailyData.map((d, i) => {
              const x = (560 / dailyData.length) * i + 20;
              const y = 200 - (d.revenue / maxDaily) * 170;
              const tooltipY = Math.max(10, y - 55); // prevents clipping top

              return (
                <g
                  key={i}
                  onMouseEnter={() => setHover({ index: i, type: "day" })}
                  onMouseLeave={() => setHover(null)}
                >
                  <circle cx={x} cy={y} r="5" fill="#1b180d" />

                  {hover?.index === i && (
                    <foreignObject x={x - 60} y={tooltipY} width="140" height="50">
                      <div className="bg-[#1b180d] text-white p-2 rounded text-center shadow-2xl text-[11px]">
                        ₹{d.revenue.toLocaleString()} <br />
                        {formatDate(d.date)}
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
}

function generateLine(data, max) {
  return data
    .map((d, i) => {
      const x = (560 / data.length) * i + 20;
      const y = 200 - (d.revenue / max) * 170;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

function formatDate(str) {
  return new Date(str).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function monthName(num) {
  return [
    "",
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ][num];
}
