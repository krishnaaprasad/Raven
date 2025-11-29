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
      <tr
        className={`relative border-b border-[#e7e1cf] hover:bg-[#fff9eb] transition ${
          isDeleted ? "opacity-40 bg-[#f6f3e7]" : ""
        }`}
      >
        <td className="p-4">
          <img
            src={product.images?.[0]?.thumbnail || product.images?.[0]?.original}
            className="w-17 h-17 rounded-lg object-cover border border-[#e7e1cf]"
            alt={product.name}
          />
        </td>

        <td className="p-4 font-medium text-[#1b180d]">{product.name}</td>
        <td className="p-4 text-[#6d6d6d]">/{product.slug}</td>
        <td className="p-4 text-[#6d6d6d]">{product.brand}</td>

        <td className="p-4 font-semibold">
          ₹{Number(basePrice).toLocaleString("en-IN")}
        </td>

        <td className="p-4">
          <span
            className={`px-2 py-1 text-[14px] rounded-full font-semibold ${
              totalStock > 50
                ? "bg-green-100 text-green-800"
                : totalStock > 0
                ? "bg-red-100 text-red-700"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {totalStock}
          </span>
        </td>

        <td className="p-4">
          <div className="flex items-center justify-end gap-2">
            {!isDeleted && (
              <a
                href={`/admin/products/${product._id}/edit`}
                className="size-9 flex items-center justify-center rounded-lg hover:bg-[#fff4dd]"
              >
                <Pencil size={18} className="text-[#b28c34]" />
              </a>
            )}

            <button
              onClick={() => setConfirmOpen(true)}
              className="size-9 flex items-center justify-center rounded-lg hover:bg-[#fff4dd]"
            >
              {isDeleted ? (
                <RotateCcw size={18} className="text-green-600" />
              ) : (
                <Trash2 size={18} className="text-red-600" />
              )}
            </button>
          </div>
        </td>
      </tr>

      {confirmOpen &&
        createPortal(
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-sm border border-[#e7e1cf] rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-bold text-[#1b180d] mb-2">
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
                  className="px-4 py-2 rounded-lg border border-[#e7e1cf] bg-[#fcfbf8] text-sm font-medium hover:bg-[#f5efe2]"
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
