"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Power, Trash2 } from "lucide-react";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const res = await fetch("/api/admin/coupons");
    const data = await res.json();
    setCoupons(data);
  };

  const toggleCoupon = async (id, currentStatus) => {
    await fetch(`/api/admin/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !currentStatus }),
    });
    fetchCoupons();
  };

  const deleteCoupon = async (id) => {
    await fetch(`/api/admin/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deleted: true }),
    });
    fetchCoupons();
  };

  return (
    <div className="min-h-screen bg-[#fcfbf8] p-2">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-semibold text-[#1b180d]">
              Coupon Management
            </h1>
            <p className="text-sm text-[#9a864c] mt-2">
              Manage discount codes and promotions
            </p>
          </div>

          <Link
            href="/admin/coupons/new"
            className="px-6 py-3 bg-[#9a864c] text-white rounded-lg hover:opacity-90 transition"
          >
            + Create Coupon
          </Link>
        </div>

        {/* Coupon Cards */}
        {coupons.length === 0 ? (
          <div className="bg-white border border-[#e7e1cf] rounded-xl p-16 text-center">
            <p className="text-[#9a864c] text-lg">
              No coupons created yet
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {coupons
              .filter((c) => !c.deleted)
              .map((c) => {
                const isExpired =
                  new Date(c.expiryDate) < new Date();

                const usagePercent = c.usageLimit
                  ? (c.usedCount / c.usageLimit) * 100
                  : 0;

                return (
                  <div
                    key={c._id}
                    className="bg-white border border-[#e7e1cf] rounded-xl p-6 shadow-sm hover:shadow-md transition"
                  >
                    {/* Code & Status */}
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold text-[#1b180d]">
                        {c.code}
                      </h2>

                      <div className="flex gap-2">
                        {isExpired && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">
                            Expired
                          </span>
                        )}
                        {!isExpired && c.isActive && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                            Active
                          </span>
                        )}
                        {!c.isActive && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            Disabled
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Discount */}
                    <p className="text-[#9a864c] font-semibold text-lg">
                      {c.type === "PERCENT"
                        ? `${c.value}% OFF`
                        : `₹${c.value} OFF`}
                    </p>

                    {c.minOrderAmount > 0 && (
                      <p className="text-sm text-[#1b180d] mt-1">
                        Min Order ₹{c.minOrderAmount}
                      </p>
                    )}

                    {/* Usage */}
                    {c.usageLimit && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Usage</span>
                          <span>
                            {c.usedCount}/{c.usageLimit}
                          </span>
                        </div>
                        <div className="h-2 bg-[#f3efe6] rounded">
                          <div
                            className="h-full bg-[#9a864c] rounded"
                            style={{
                              width: `${usagePercent}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Expiry */}
                    <p className="text-xs text-[#9a864c] mt-4">
                      Expires:{" "}
                      {new Date(c.expiryDate).toLocaleDateString()}
                    </p>

                    {/* Actions */}
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#e7e1cf]">
                      <div className="flex gap-4">
                        <Link
                          href={`/admin/coupons/${c._id}`}
                          className="text-[#9a864c] hover:opacity-70"
                        >
                          <Pencil size={18} />
                        </Link>

                        <button
                          onClick={() =>
                            toggleCoupon(c._id, c.isActive)
                          }
                          className="text-[#9a864c] hover:opacity-70"
                        >
                          <Power size={18} />
                        </button>

                        <button
                          onClick={() => deleteCoupon(c._id)}
                          className="text-red-500 hover:opacity-70"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}