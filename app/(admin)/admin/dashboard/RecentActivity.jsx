"use client";

import { useEffect, useState } from "react";
import { ReceiptText } from "lucide-react";

export default function RecentActivity() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/recent-activity");
        const data = await res.json();
        setOrders(data);
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
      <div className="rounded-xl border border-[#e7e1cf] p-6 bg-[#fcfbf8]">
        Loading recent activity...
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
      case "paid":
      case "shipped":
        return "text-green-600";
      case "processing":
      case "pending":
        return "text-yellow-600";
      case "cancelled":
      case "failed":
        return "text-red-600";
      default:
        return "text-[#9a864c]";
    }
  };

  return (
    <div className="rounded-xl border border-[#e7e1cf] p-6 bg-[#fcfbf8] w-full">
      <h4 className="text-lg font-serif font-semibold mb-4 text-[#1b180d]">
        Recent Activity
      </h4>

      <ul className="space-y-4">
        {orders.slice() // Don't mutate original
          .sort((a, b) => new Date(b.date) - new Date(a.date)) // most recent first
          .slice(0, 5) // take top 5 only
          .map((item) => (
          <li key={item.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#fff9ee] flex items-center justify-center text-[#9a864c]">
                <ReceiptText size={18} />
              </div>
              <div>
                <div className="font-semibold text-[#1b180d]">
                  {item.id}
                </div>
                <div className="text-sm text-[#6d6c6c]">{item.name}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-normal">₹{item.amount}</div>
              <div className={`text-sm ${getStatusColor(item.status)}`}>
                {item.status}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
