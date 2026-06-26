"use client";

import { AlertCircle } from "lucide-react";

export default function OverduePayments({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-[#e7e1cf] p-5 bg-white shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle size={16} className="text-[#b28c34]" />
          <h3 className="text-sm font-bold text-[#1b180d]">Overdue Payments</h3>
        </div>
        <p className="text-xs text-[#6b6654]">No overdue payments</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 p-5 bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle size={16} className="text-red-500" />
        <h3 className="text-sm font-bold text-[#1b180d]">Overdue Payments</h3>
      </div>
      <div className="space-y-2.5">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-[#fcfbf8] border border-[#e7e1cf]">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#1b180d] truncate">{item.customer}</p>
              <p className="text-[10px] text-[#6b6654]">{item.orderId}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-[#1b180d]">
                ₹{Number(item.amount).toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-red-50 text-red-600">
                {item.daysOverdue}d
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
