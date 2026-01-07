"use client";

import { useEffect, useState } from "react";

export default function RevenueChart() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null); // { monthIndex, year }
  const [hover, setHover] = useState(null);
  const monthIndex = selectedMonth ? selectedMonth.monthIndex : null;
  const year = selectedMonth ? selectedMonth.year : null;

  useEffect(() => {
    loadMonthly();
  }, []);

  async function loadMonthly() {
    try {
      const res = await fetch("/api/admin/revenue-monthly");
      const json = await res.json();

      const sorted = (json.data || []).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.monthIndex - b.monthIndex;
      });

      setMonthlyData(sorted);
    } catch (err) {
      console.error("Monthly revenue API error:", err);
    }
  }

  async function loadDaily(monthIndex, year) {
    try {
      const res = await fetch(
  `/api/admin/revenue-stats?month=${monthIndex}&year=${year}`
);
      const json = await res.json();
      setDailyData(json.data || []);
      setSelectedMonth(monthIndex);
      setHover(null);
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
            ? `Revenue for ${monthName(selectedMonth.monthIndex)} ${selectedMonth.year}`
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

      <div className="h-72 rounded-lg border border-[#e7e1cf] bg-white p-4 relative overflow-visible">
        {/* ===================== MONTHLY BAR CHART ===================== */}
        {!selectedMonth && (
          <svg viewBox="0 0 600 260" className="w-full h-full overflow-visible">
            {monthlyData.map((m, i) => {
              const height = (m.revenue / maxMonthly) * 170;
              const barX = i * barWidth + 25;
              const barY = 200 - height;

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
                    width={barWidth - 25}
                    height={height}
                    fill="#b28c34"
                    rx="6"
                  />

                  <text
                    x={barX + (barWidth - 25) / 2}
                    y={230}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#6b6654"
                  >
                    {`${monthShort(m.monthIndex)} ${String(m.year).slice(-2)}`}
                  </text>

                  {hover?.index === i && (
                    <foreignObject
                      x={barX - 30}
                      y={barY - 60}
                      width="120"
                      height="55"
                      style={{ overflow: "visible" }}
                    >
                      <div className="bg-[#1b180d] text-white text-xs p-2 rounded shadow-xl text-center leading-tight">
                        <div>₹{m.revenue.toLocaleString()}</div>
                        <div className="opacity-80">{m.orders} orders</div>
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })}
          </svg>
        )}

        {/* ===================== DAILY LINE CHART ===================== */}
        {selectedMonth && (
          <svg viewBox="0 0 600 220" className="w-full h-full overflow-visible">
            <path
              d={generateLine(dailyData, maxDaily)}
              stroke="#b28c34"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />

            {dailyData.map((d, i) => {
              const x = (600 / dailyData.length) * i + 20;
              const y = 180 - (d.revenue / maxDaily) * 160;

              return (
                <g
                  key={i}
                  onMouseEnter={() => setHover({ index: i })}
                  onMouseLeave={() => setHover(null)}
                >
                  <circle cx={x} cy={y} r="5" fill="#1b180d" />

                  {hover?.index === i && (
                    <foreignObject
                      x={Math.max(10, x - 65)}
                      y={Math.max(10, y - 65)}
                      width="140"
                      height="60"
                    >
                      <div className="bg-[#1b180d] text-white text-xs p-2 rounded shadow-lg text-center leading-tight">
                        <div>₹{d.revenue.toLocaleString()}</div>
                        <div>{formatDate(d.date)}</div>
                        <div>{d.orders} orders</div>
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
      const x = (600 / data.length) * i + 20;
      const y = 180 - (d.revenue / max) * 160;
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
  return [
    "",
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ][num];
}

function monthShort(num) {
  return [
    "",
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ][num];
}

