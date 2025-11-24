// app/admin/dashboard/RevenueChart.jsx
"use client";

import { useEffect, useState } from "react";

export default function RevenueChart() {
  const [range, setRange] = useState("30 Days");
  const [data, setData] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/revenue-stats");
        const d = await res.json();
        setData(d);
      } catch (e) {
        console.error("Revenue stats error:", e);
      }
    }
    load();
  }, []);

  // Total revenue (header)
  const total = data.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="rounded-xl border border-[#e7e1cf] p-6 bg-[#fcfbf8] w-full">
      
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-serif text-[#1b180d]">Daily Revenue</p>

          <div className="flex items-baseline gap-3">
            <div className="text-3xl font-serif font-semibold text-[#1b180d]">
              ₹{total.toLocaleString()}
            </div>
            <div className="text-sm text-green-600">+12.5%</div>
          </div>

          <p className="text-sm text-[#9a864c]">Last 30 Days</p>
        </div>

        {/* Filter (only 30 days for now) */}
        <div className="flex items-center gap-2 rounded-md p-1 bg-white border border-[#e7e1cf]">
          <button
            className="px-3 py-1 text-sm rounded-md bg-[#f3efe6] font-semibold"
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-4">
        <div className="h-48 rounded-md bg-white border border-[#e7e1cf] p-4 overflow-hidden">
          <svg viewBox="0 0 600 140" className="w-full h-full">

            {/* Gold gradient fill */}
            <defs>
              <linearGradient id="goldFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#9a864c" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#9a864c" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Smooth gold line */}
            <path
              d={generateSmoothPath(data)}
              stroke="#9a864c"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />

            {/* Fill under the curve */}
            <path
              d={generateArea(data)}
              fill="url(#goldFill)"
              opacity="0.6"
            />

          </svg>
        </div>
      </div>

    </div>
  );
}

/** Convert data points → smooth SVG curve */
function generateSmoothPath(data) {
  if (!data.length) return "";

  const max = Math.max(...data.map((d) => d.revenue), 1);
  const stepX = 600 / Math.max(data.length - 1, 1);

  return data
    .map((d, i) => {
      const x = i * stepX;
      const y = 120 - (d.revenue / max) * 110;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

/** Fill area below the curve */
function generateArea(data) {
  if (!data.length) return "";

  const max = Math.max(...data.map((d) => d.revenue), 1);
  const stepX = 600 / Math.max(data.length - 1, 1);

  let path = data
    .map((d, i) => {
      const x = i * stepX;
      const y = 120 - (d.revenue / max) * 110;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  // Close bottom area
  path += ` L600,140 L0,140 Z`;

  return path;
}
