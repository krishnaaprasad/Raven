"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateCoupon() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    code: "",
    type: "PERCENT",
    value: "",
    minOrderAmount: "",
    maxDiscount: "",
    usageLimit: "",
    expiryDate: "",
    isActive: true,
  });

  // Compute today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Format ISO date string (YYYY-MM-DD) to locale-friendly date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          value: Number(form.value),
          minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
          maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
          usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create coupon: ${res.status}`);
      }

      setError(null);
      router.push("/admin/coupons");
    } catch (err) {
      console.error('Error creating coupon:', err);
      setError(err.message || 'Failed to create coupon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf8] p-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-[#1b180d]">Create New Coupon</h1>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT FORM SECTION */}
          <fieldset disabled={loading} className="lg:col-span-2 space-y-8">

            {/* Basic Info */}
            <div className="bg-white border border-[#e7e1cf] rounded-xl p-6 space-y-5">
              <h2 className="text-lg font-semibold text-[#1b180d]">
                Basic Information
              </h2>

              <div>
                <label className="text-sm text-[#9a864c]">Coupon Code</label>
                <input
                  required
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  className="w-full mt-1 border border-[#e7e1cf] p-3 rounded-lg focus:outline-none focus:border-[#9a864c]"
                  placeholder="SAVE20"
                />
              </div>

              <div>
                <label className="text-sm text-[#9a864c]">Discount Type</label>
                <select
                  value={form.type}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setForm({
                      ...form,
                      type: newType,
                      ...(newType === "FLAT" && { maxDiscount: "" })
                    });
                  }}
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
                  required
                  min="0"
                  max={form.type === "PERCENT" ? "100" : undefined}
                  value={form.value}
                  onChange={(e) => {
                    let val = e.target.value ? Number(e.target.value) : "";
                    if (val !== "" && form.type === "PERCENT") {
                      val = Math.max(0, Math.min(100, val));
                    } else if (val !== "") {
                      val = Math.max(0, val);
                    }
                    setForm({ ...form, value: val });
                  }}
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
                    min="0"
                    value={form.maxDiscount || ""}
                    onChange={(e) => {
                      let val = e.target.value ? Number(e.target.value) : "";
                      if (val !== "") {
                        val = Math.max(0, val);
                      }
                      setForm({ ...form, maxDiscount: val });
                    }}
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
                  min="0"
                  value={form.minOrderAmount || ""}
                  onChange={(e) => {
                    let val = e.target.value ? Number(e.target.value) : "";
                    if (val !== "") {
                      val = Math.max(0, val);
                    }
                    setForm({ ...form, minOrderAmount: val });
                  }}
                  className="w-full mt-1 border border-[#e7e1cf] p-3 rounded-lg focus:outline-none focus:border-[#9a864c]"
                />
              </div>

              <div>
                <label className="text-sm text-[#9a864c]">
                  Usage Limit (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.usageLimit || ""}
                  onChange={(e) => {
                    let val = e.target.value ? Number(e.target.value) : "";
                    if (val !== "") {
                      val = Math.max(0, val);
                    }
                    setForm({ ...form, usageLimit: val });
                  }}
                  className="w-full mt-1 border border-[#e7e1cf] p-3 rounded-lg focus:outline-none focus:border-[#9a864c]"
                />
              </div>

              <div>
                <label className="text-sm text-[#9a864c]">
                  Expiry Date
                </label>
                <input
                  type="date"
                  required
                  min={getTodayDate()}
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
                  Activate coupon immediately
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-[#9a864c] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Coupon"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/admin/coupons")}
                disabled={loading}
                className="px-8 py-3 border border-[#e7e1cf] rounded-lg hover:bg-[#f3efe6] transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </fieldset>

          {/* RIGHT PREVIEW PANEL */}
          <div className="bg-white border border-[#e7e1cf] rounded-xl p-6 h-fit">
            <h2 className="text-lg font-semibold text-[#1b180d] mb-4">
              Preview
            </h2>

            <div className="border border-dashed border-[#9a864c] p-6 text-center rounded-lg">
              <p className="text-xl font-bold text-[#9a864c]">
                {form.code || "CODE"}
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
                  Expires on {formatDate(form.expiryDate)}
                </p>
              )}
            </div>
          </div>
          </div>

        </form>
      </div>
    </div>
  );
}