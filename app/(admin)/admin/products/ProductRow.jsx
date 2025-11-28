"use client";

import { Pencil, Trash2, RotateCcw } from "lucide-react";

export default function ProductRow({ product, refresh }) {
  const basePrice = product.variants?.[0]?.price || 0;
  const totalStock = product.variants?.reduce((a, v) => a + (v.stock || 0), 0) || 0;

  const isDeleted = product?.deleted;

  const handleDeleteRestore = async () => {
    await fetch(`/api/admin/products/${product._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deleted: !isDeleted }),
    });
    refresh?.();
  };

  return (
    <tr
      className={`border-b border-[#e7e1cf] hover:bg-[#fff9eb] transition ${
        isDeleted ? "opacity-50" : ""
      }`}
    >
      <td className="p-4">
        <div
          className="size-14 rounded-lg bg-cover bg-center"
          style={{ backgroundImage: `url(${product.images?.[0]?.thumbnail || product.images?.[0]?.original})` }}
        ></div>
      </td>

      <td className="p-4 font-medium">{product.name}</td>
      <td className="p-4 text-[#6d6d6d]">{product.slug}</td>
      <td className="p-4 text-[#6d6d6d]">{product.brand}</td>
      <td className="p-4 font-semibold">₹{Number(basePrice).toLocaleString("en-IN")}</td>

      <td className="p-4">
        <span
          className={`px-2 py-1 text-[12px] rounded-full font-medium ${
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
            onClick={handleDeleteRestore}
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
  );
}
