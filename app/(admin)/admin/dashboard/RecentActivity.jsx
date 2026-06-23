"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";

export default function RecentActivity() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/recent-activity");
        const data = await res.json();
        if (Array.isArray(data)) setOrders(data);
      } catch (err) {
        console.error("Failed to load recent activity:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-[#e7e1cf] p-5 bg-white animate-pulse">
        <div className="h-4 w-32 bg-[#f0ece3] rounded mb-4" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-[#f8f5ee] rounded-lg mb-2" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#e7e1cf] p-5 bg-white w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-[#b28c34]" />
          <h4 className="text-sm font-bold text-[#1b180d]">Recent Orders</h4>
        </div>
        <Link
          href="/admin/orders"
          className="text-[11px] font-medium text-[#b28c34] hover:underline inline-flex items-center gap-1"
        >
          View All <ArrowRight size={10} />
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="text-xs text-[#6b6654] text-center py-4">No recent orders</p>
      ) : (
        <ul className="space-y-2.5">
          {orders.slice(0, 6).map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#fcfbf8] transition"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <StatusDot status={item.status} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#1b180d] truncate">
                    {item.id}
                  </p>
                  <p className="text-[11px] text-[#6b6654] truncate">{item.name}</p>
                </div>
              </div>

              <div className="text-right shrink-0 ml-2">
                <p className="text-xs font-semibold text-[#1b180d]">
                  ₹{Number(item.amount || 0).toLocaleString("en-IN")}
                </p>
                <p className={`text-[10px] font-medium ${getStatusColor(item.status)}`}>
                  {item.status}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusDot({ status }) {
  const color = getDotColor(status);
  return (
    <div className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
  );
}

function getDotColor(status) {
  const s = (status || "").toLowerCase();
  if (["delivered", "paid"].includes(s)) return "bg-green-500";
  if (["shipped", "out for delivery"].includes(s)) return "bg-blue-500";
  if (["processing"].includes(s)) return "bg-yellow-500";
  if (["cancelled", "failed"].includes(s)) return "bg-red-500";
  return "bg-gray-400";
}

function getStatusColor(status) {
  const s = (status || "").toLowerCase();
  if (["delivered", "paid"].includes(s)) return "text-green-600";
  if (["shipped", "out for delivery"].includes(s)) return "text-blue-600";
  if (["processing", "pending"].includes(s)) return "text-yellow-600";
  if (["cancelled", "failed"].includes(s)) return "text-red-600";
  return "text-[#6b6654]";
}
