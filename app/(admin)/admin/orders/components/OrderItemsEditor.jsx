"use client";

import { Plus, Trash2 } from "lucide-react";

export const emptyItem = () => ({ slug: "", variantSize: "", quantity: 1, price: "" });

export const itemsSubtotal = (items) =>
  items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.price) || 0), 0);

/**
 * Product lines for a manual order: product, size, qty and price per row.
 * Keep one row for a single-product order; "Add product" for more.
 * `heldQty` (edit mode) = quantities this order already holds, so the stock hint
 * shows what is really available for it.
 */
export default function OrderItemsEditor({ products, items, onChange, heldQty = {} }) {
  const setRow = (idx, patch) => onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const removeRow = (idx) => onChange(items.filter((_, i) => i !== idx));
  const addRow = () => onChange([...items, emptyItem()]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs text-gray-600">Products*</label>
        <span className="text-[11px] text-gray-500">{items.length} item{items.length === 1 ? "" : "s"}</span>
      </div>

      {items.map((it, idx) => {
        const product = products.find((p) => p.slug === it.slug);
        const variant = product?.variants?.find((v) => String(v.size) === String(it.variantSize));
        const available =
          variant != null ? Number(variant.stock || 0) + Number(heldQty[`${it.slug}|${it.variantSize}`] || 0) : null;
        const lineTotal = (Number(it.quantity) || 0) * (Number(it.price) || 0);
        const overStock = available != null && Number(it.quantity) > available;

        return (
          <div key={idx} className="border rounded-lg p-2 space-y-2 bg-[#fcfbf8]">
            <div className="flex gap-2 items-start">
              <select
                value={it.slug}
                onChange={(e) => setRow(idx, { slug: e.target.value, variantSize: "", price: "" })}
                className="flex-1 h-9 border rounded-md px-2 text-sm text-[#1b180d] bg-white"
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p._id} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>

              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  aria-label="Remove product"
                  className="h-9 w-9 shrink-0 flex items-center justify-center border rounded-md text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {product && (
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={it.variantSize}
                  onChange={(e) => {
                    const v = product.variants.find((x) => String(x.size) === e.target.value);
                    setRow(idx, { variantSize: e.target.value, price: v?.price ?? "" });
                  }}
                  className="h-9 border rounded-md px-2 text-sm text-[#1b180d] bg-white"
                >
                  <option value="">Size</option>
                  {product.variants.map((v) => (
                    <option key={v.size} value={v.size}>
                      {v.size}
                    </option>
                  ))}
                </select>

                <NumberBox
                  placeholder="Qty"
                  value={it.quantity}
                  onChange={(v) => setRow(idx, { quantity: v })}
                  invalid={overStock}
                />
                <NumberBox placeholder="Price" value={it.price} onChange={(v) => setRow(idx, { price: v })} />
              </div>
            )}

            {variant && (
              <div className="flex justify-between text-[11px]">
                <span className={overStock ? "text-red-600 font-medium" : "text-gray-500"}>
                  {overStock ? `Only ${available} in stock` : `${available} in stock`}
                </span>
                <span className="text-gray-700">₹{lineTotal.toFixed(2)}</span>
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={addRow}
        className="w-full h-8 border border-dashed rounded-md text-xs font-medium text-[#b28c34] hover:bg-[#fcfbf8] flex items-center justify-center gap-1"
      >
        <Plus size={14} /> Add product
      </button>
    </div>
  );
}

function NumberBox({ value, onChange, placeholder, invalid }) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min="0"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onWheel={(e) => e.target.blur()}
      className={`h-9 border rounded-md px-2 text-sm text-[#1b180d] bg-white ${invalid ? "border-red-500" : ""}`}
    />
  );
}
