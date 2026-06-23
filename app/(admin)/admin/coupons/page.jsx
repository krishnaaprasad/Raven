"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Pencil, Power, Trash2, Plus, Tag, Percent, BadgePercent } from "lucide-react";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/coupons");
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      setCoupons(data);
    } catch (err) {
      console.error("Error fetching coupons:", err);
      setError(err.message);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const toggleCoupon = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (!res.ok) throw new Error("Failed to update");
      await fetchCoupons();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm("Delete this coupon permanently?")) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleted: true }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchCoupons();
    } catch (err) {
      alert(err.message);
    }
  };

  const activeCoupons = coupons.filter((c) => !c.deleted);
  const activeCouponCount = activeCoupons.filter((c) => c.isActive).length;
  const expiredCount = activeCoupons.filter((c) => {
    if (!c.expiryDate) return false;
    return new Date(c.expiryDate) < new Date();
  }).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1b180d]">Coupons</h1>
          <p className="text-xs text-[#6b6654]">
            {activeCoupons.length} coupons · {activeCouponCount} active · {expiredCount} expired
          </p>
        </div>

        <Link
          href="/admin/coupons/new"
          className="inline-flex items-center gap-2 h-9 px-4 bg-[#1b180d] text-white rounded-lg text-xs font-semibold hover:bg-[#2a2618] transition"
        >
          <Plus size={14} /> New Coupon
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#e7e1cf] overflow-hidden bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-sm text-[#6b6654]">
            <div className="w-5 h-5 border-2 border-[#b28c34] border-t-transparent rounded-full animate-spin mb-2" />
            Loading coupons...
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-red-600 text-sm">{error}</p>
            <button onClick={fetchCoupons} className="mt-2 px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg">Retry</button>
          </div>
        ) : activeCoupons.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#9a864c]">No coupons yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-[#1b180d]">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Code</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Discount</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Min Order</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Usage</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Expires</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Status</th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-white/80">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece3]">
                {activeCoupons.map((c) => {
                  const isValidExpiry = c.expiryDate && !isNaN(Date.parse(c.expiryDate));
                  const isExpired = isValidExpiry && new Date(c.expiryDate) < new Date();
                  const usageText = c.usageLimit ? `${c.usedCount || 0}/${c.usageLimit}` : `${c.usedCount || 0}/∞`;
                  const usagePercent = c.usageLimit ? ((c.usedCount || 0) / c.usageLimit) * 100 : 0;

                  return (
                    <tr key={c._id} className="hover:bg-[#faf8f3] transition-colors duration-150">
                      {/* Code */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#fff9ee] flex items-center justify-center">
                            <Tag size={14} className="text-[#b28c34]" />
                          </div>
                          <span className="text-[13px] font-bold text-[#1b180d] tracking-wide">{c.code}</span>
                        </div>
                      </td>

                      {/* Discount */}
                      <td className="px-4 py-3.5">
                        <span className="text-[13px] font-semibold text-[#b28c34]">
                          {c.type === "PERCENT" ? `${c.value}%` : `₹${c.value}`}
                          {c.type === "PERCENT" && c.maxDiscount ? (
                            <span className="text-[10px] text-[#6b6654] font-normal ml-1">(max ₹{c.maxDiscount})</span>
                          ) : null}
                        </span>
                      </td>

                      {/* Min Order */}
                      <td className="px-4 py-3.5 text-[12px] text-[#4a4637]">
                        {c.minOrderAmount > 0 ? `₹${c.minOrderAmount}` : "—"}
                      </td>

                      {/* Usage */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-[#f0ece3] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${usagePercent >= 90 ? "bg-red-500" : "bg-[#b28c34]"}`}
                              style={{ width: `${Math.min(usagePercent, 100)}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-[#6b6654]">{usageText}</span>
                        </div>
                      </td>

                      {/* Expires */}
                      <td className="px-4 py-3.5 text-[12px] text-[#4a4637]">
                        {isValidExpiry
                          ? new Date(c.expiryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                          : "No expiry"}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {isExpired ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-600">Expired</span>
                        ) : c.isActive ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700">Active</span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">Disabled</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/coupons/${c._id}`}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f5f1e6] transition"
                            title="Edit"
                          >
                            <Pencil size={14} className="text-[#b28c34]" />
                          </Link>

                          <button
                            onClick={() => toggleCoupon(c._id, c.isActive)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition ${
                              c.isActive ? "hover:bg-orange-50" : "hover:bg-green-50"
                            }`}
                            title={c.isActive ? "Disable" : "Enable"}
                          >
                            <Power size={14} className={c.isActive ? "text-orange-500" : "text-green-600"} />
                          </button>

                          <button
                            onClick={() => deleteCoupon(c._id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition"
                            title="Delete"
                          >
                            <Trash2 size={14} className="text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
