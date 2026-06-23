"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Pencil, Trash2, RotateCcw } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ProductRow({ product, refresh }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const basePrice = product.variants?.[0]?.price || 0;
  const totalStock = product.variants?.reduce((a, v) => a + (v.stock || 0), 0) || 0;
  const isDeleted = product?.deleted;

  // Use original image (not thumbnail) for better quality
  const imageUrl = product.images?.[0]?.original || product.images?.[0]?.thumbnail || "";

  const handleDeleteRestore = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${product._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleted: !isDeleted }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(isDeleted ? "Product Restored" : "Product Disabled");
      refresh?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setConfirmOpen(false);
      setLoading(false);
    }
  };

  return (
    <>
      <tr className={`hover:bg-[#faf8f3] transition-colors duration-150 ${isDeleted ? "opacity-40" : ""}`}>
        {/* Product (image + name combined) */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#e7e1cf] bg-[#f9f7f2] shrink-0">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-[#9a864c]">
                  No img
                </div>
              )}
            </div>
            <span className="font-semibold text-[13px] text-[#1b180d]">{product.name}</span>
          </div>
        </td>

        {/* Slug */}
        <td className="px-4 py-3 text-[12px] text-[#6b6654]">
          /{product.slug}
        </td>

        {/* Brand */}
        <td className="px-4 py-3 text-[13px] text-[#4a4637]">
          {product.brand || "—"}
        </td>

        {/* Price */}
        <td className="px-4 py-3 font-semibold text-[13px] text-[#1b180d]">
          ₹{Number(basePrice).toLocaleString("en-IN")}
        </td>

        {/* Stock */}
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 text-[12px] font-semibold rounded-full ${
              totalStock === 0
                ? "bg-gray-100 text-gray-500"
                : totalStock <= 5
                ? "bg-red-50 text-red-600"
                : totalStock <= 20
                ? "bg-orange-50 text-orange-600"
                : "bg-green-50 text-green-700"
            }`}
          >
            {totalStock}
          </span>
        </td>

        {/* Actions */}
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1.5">
            {!isDeleted && (
              <a
                href={`/admin/products/${product._id}/edit`}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f5f1e6] transition"
                title="Edit"
              >
                <Pencil size={15} className="text-[#b28c34]" />
              </a>
            )}

            <button
              onClick={() => setConfirmOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition"
              title={isDeleted ? "Restore" : "Disable"}
            >
              {isDeleted ? (
                <RotateCcw size={15} className="text-green-600" />
              ) : (
                <Trash2 size={15} className="text-red-500" />
              )}
            </button>
          </div>
        </td>
      </tr>

      {confirmOpen &&
        createPortal(
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-sm border border-[#e7e1cf] rounded-xl p-6 shadow-lg text-[#1b180d]">
              <h2 className="text-lg font-bold mb-2">
                {isDeleted ? "Restore Product?" : "Disable Product?"}
              </h2>

              <p className="text-sm text-[#6b6654] mb-6">
                {isDeleted
                  ? "This product will be active again and visible in the store."
                  : "This product will be hidden from users but remain safely stored."}
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#e7e1cf] text-sm font-medium hover:bg-[#f5f1e6]"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDeleteRestore}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold text-white ${
                    isDeleted
                      ? "bg-green-700 hover:bg-green-800"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {loading ? "Processing…" : isDeleted ? "Restore" : "Disable"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
