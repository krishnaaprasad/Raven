"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditCoupon() {
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    const fetchCoupon = async () => {
      const res = await fetch(`/api/admin/coupons/${id}`);
      const data = await res.json();

      setForm({
        ...data,
        expiryDate: data.expiryDate?.slice(0, 10),
      });

      setLoading(false);
    };

    fetchCoupon();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    await fetch(`/api/admin/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    router.push("/admin/coupons");
  };

  if (loading || !form) return null;

  return (
    <div className="min-h-screen bg-[#fcfbf8] p-2">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-[#1b180d]">
            Edit Coupon
          </h1>
          <p className="text-sm text-[#9a864c] mt-2">
            Update discount rules and restrictions
          </p>
        </div>

        <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT SECTION */}
          <div className="lg:col-span-2 space-y-8">

            {/* Basic Info */}
            <div className="bg-white border border-[#e7e1cf] rounded-xl p-6 space-y-5">
              <h2 className="text-lg font-semibold text-[#1b180d]">
                Basic Information
              </h2>

              <div>
                <label className="text-sm text-[#9a864c]">Coupon Code</label>
                <input
                  value={form.code}
                  disabled
                  className="w-full mt-1 border border-[#e7e1cf] p-3 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="text-sm text-[#9a864c]">Discount Type</label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value })
                  }
                  className="w-full mt-1 border border-[#e7e1cf] p-3 rounded-lg focus:outline-none focus:border-[#9a864c]"
                >
                  <option value="PERCENT">Percentage (%)</option>
                  <option value="FLAT">Flat Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-[#9a864c]">
                  {form.type === "PERCENT"
                    ? "Discount Percentage"
                    : "Flat Discount Amount"}
                </label>
                <input
                  type="number"
                  value={form.value}
                  onChange={(e) =>
                    setForm({ ...form, value: e.target.value })
                  }
                  className="w-full mt-1 border border-[#e7e1cf] p-3 rounded-lg focus:outline-none focus:border-[#9a864c]"
                />
              </div>

              {form.type === "PERCENT" && (
                <div>
                  <label className="text-sm text-[#9a864c]">
                    Maximum Discount (Optional)
                  </label>
                  <input
                    type="number"
                    value={form.maxDiscount || ""}
                    onChange={(e) =>
                      setForm({ ...form, maxDiscount: e.target.value })
                    }
                    className="w-full mt-1 border border-[#e7e1cf] p-3 rounded-lg focus:outline-none focus:border-[#9a864c]"
                  />
                </div>
              )}
            </div>

            {/* Restrictions */}
            <div className="bg-white border border-[#e7e1cf] rounded-xl p-6 space-y-5">
              <h2 className="text-lg font-semibold text-[#1b180d]">
                Usage Restrictions
              </h2>

              <div>
                <label className="text-sm text-[#9a864c]">
                  Minimum Order Amount (₹)
                </label>
                <input
                  type="number"
                  value={form.minOrderAmount || ""}
                  onChange={(e) =>
                    setForm({ ...form, minOrderAmount: e.target.value })
                  }
                  className="w-full mt-1 border border-[#e7e1cf] p-3 rounded-lg focus:outline-none focus:border-[#9a864c]"
                />
              </div>

              <div>
                <label className="text-sm text-[#9a864c]">
                  Usage Limit
                </label>
                <input
                  type="number"
                  value={form.usageLimit || ""}
                  onChange={(e) =>
                    setForm({ ...form, usageLimit: e.target.value })
                  }
                  className="w-full mt-1 border border-[#e7e1cf] p-3 rounded-lg focus:outline-none focus:border-[#9a864c]"
                />
                <p className="text-xs text-[#9a864c] mt-1">
                  Used {form.usedCount || 0} times
                </p>
              </div>

              <div>
                <label className="text-sm text-[#9a864c]">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) =>
                    setForm({ ...form, expiryDate: e.target.value })
                  }
                  className="w-full mt-1 border border-[#e7e1cf] p-3 rounded-lg focus:outline-none focus:border-[#9a864c]"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={() =>
                    setForm({ ...form, isActive: !form.isActive })
                  }
                  className="accent-[#9a864c] w-4 h-4"
                />
                <label className="text-sm text-[#1b180d]">
                  Coupon is active
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-[#9a864c] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {saving ? "Updating..." : "Update Coupon"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/admin/coupons")}
                className="px-8 py-3 border border-[#e7e1cf] rounded-lg hover:bg-[#f3efe6] transition"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* RIGHT PREVIEW PANEL */}
          <div className="bg-white border border-[#e7e1cf] rounded-xl p-6 h-fit">
            <h2 className="text-lg font-semibold text-[#1b180d] mb-4">
              Preview
            </h2>

            <div className="border border-dashed border-[#9a864c] p-6 text-center rounded-lg">
              <p className="text-xl font-bold text-[#9a864c]">
                {form.code}
              </p>

              <p className="mt-2 text-sm text-[#1b180d]">
                {form.type === "PERCENT"
                  ? `${form.value || 0}% OFF`
                  : `₹${form.value || 0} OFF`}
              </p>

              {form.minOrderAmount && (
                <p className="text-xs text-[#9a864c] mt-2">
                  Min Order ₹{form.minOrderAmount}
                </p>
              )}

              {form.expiryDate && (
                <p className="text-xs text-red-500 mt-2">
                  Expires on {form.expiryDate}
                </p>
              )}

              {!form.isActive && (
                <p className="text-xs text-gray-500 mt-2">
                  Currently Disabled
                </p>
              )}
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}