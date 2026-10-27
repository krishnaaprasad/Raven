"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import OrderItemsEditor, { itemsSubtotal } from "../orders/components/OrderItemsEditor";

export default function EditOrderModal({ order, onClose, onUpdated }) {
  const [products, setProducts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState(() =>
    (order.cartItems || []).map((l) => ({
      slug: l.slug,
      variantSize: l.size,
      quantity: l.quantity,
      price: l.price,
    }))
  );

  // Quantities this order already holds — added to the stock hint while editing
  const heldQty = useMemo(() => {
    if (!order.stockDeducted || order.stockRestored) return {};
    const m = {};
    for (const l of order.cartItems || []) {
      const k = `${l.slug}|${l.size}`;
      m[k] = (m[k] || 0) + Number(l.quantity || 0);
    }
    return m;
  }, [order]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/products?limit=1000");
      const json = await res.json().catch(() => ({}));
      if (json.success) setProducts(json.data || []);
    })();
  }, []);

  const [form, setForm] = useState({
    userName: order.userName || "",
    email: order.email || "",
    phone: order.phone || "",
    address: order.addressDetails?.address1 || "",
    city: order.addressDetails?.city || "",
    state: order.addressDetails?.state || "",
    pincode: order.addressDetails?.pincode || "",
    shippingCharge: order.shippingCharge || 0,
    // ✅ ADD THESE
    discount: order.discount || 0,
    couponCode: order.couponCode || "",
    paymentMethod: order.paymentMethod || "Cash",
    remark: "",
  });

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const INDIAN_STATES = [
  "Andhra Pradesh",
  "Andaman and Nicobar Islands",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

  const PAYMENT_METHODS = [
  "Cash",
  "UPI",
  "Bank Transfer",
  "FOC",
];

  const subtotal = useMemo(() => itemsSubtotal(items), [items]);
  const total = useMemo(() => {
    const ship = Number(form.shippingCharge || 0);
    const discount = Number(form.discount || 0);
    return Math.max(0, subtotal + ship - discount);
  }, [form, subtotal]);

  const handleUpdate = async () => {
    if (saving) return;
    if (items.some((it) => !it.slug || !it.variantSize)) {
      toast.error("Choose a product and size on every row");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${order._id}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast.success("Manual order updated");
      onUpdated?.();
      onClose();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-3">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl flex flex-col text-[#1b180d]">

        {/* HEADER */}
        <div className="flex justify-between px-4 py-3 border-b">
          <h2 className="text-sm font-semibold">Edit Manual Order</h2>
          <button onClick={onClose}><X size={16} /></button>
        </div>

        {/* BODY (SCROLLABLE) */}
        <div className="px-4 py-3 space-y-3 text-sm max-h-[70vh] overflow-y-auto">

          {/* LOCKED */}
          <Input
            label="Order Date"
            value={new Date(order.createdAt).toLocaleDateString()}
            disabled
          />

          <Input label="Customer Name"
            value={form.userName}
            onChange={e => update("userName", e.target.value)}
          />

          <Input label="Phone"
            value={form.phone}
            onChange={e => update("phone", e.target.value)}
          />

          <Input label="Email"
            value={form.email}
            onChange={e => update("email", e.target.value)}
          />

          <Input label="Address"
            value={form.address}
            onChange={e => update("address", e.target.value)}
          />

          {/* CITY / STATE / PINCODE */}
          <div className="grid grid-cols-2 gap-2">
            <Input label="City"
              value={form.city}
              onChange={e => update("city", e.target.value)}
            />
            <div>
  <label className="text-xs text-gray-600">State</label>
  <select
    value={form.state}
    onChange={e => update("state", e.target.value)}
    className="w-full h-9 border rounded-md px-3 text-sm text-[#1b180d] bg-white"
  >
    <option value="">Select state</option>
    {INDIAN_STATES.map(state => (
      <option key={state} value={state}>
        {state}
      </option>
    ))}
  </select>
</div>

          </div>

          <Input label="Pincode"
            value={form.pincode}
            onChange={e => update("pincode", e.target.value)}
          />

          {/* PRODUCTS */}
          <OrderItemsEditor products={products} items={items} onChange={setItems} heldQty={heldQty} />

          {/* NUMBERS – scroll disabled */}
          <div className="grid grid-cols-2 gap-2">
            <NumberInput
              label="Shipping"
              value={form.shippingCharge}
              onChange={v => update("shippingCharge", v)}
            />
            <NumberInput
              label="Discount"
              value={form.discount}
              onChange={v => update("discount", v)}
            />
            
          </div>
          <div>
  <label className="text-xs text-gray-600">Payment Method</label>
  <select
    value={form.paymentMethod}
    onChange={e => update("paymentMethod", e.target.value)}
    className="w-full h-9 border rounded-md px-3 text-sm text-[#1b180d] bg-white"
  >
    {PAYMENT_METHODS.map(method => (
      <option key={method} value={method}>
        {method}
      </option>
    ))}

    
  </select>
  <Input
      label="Coupon Code (Optional)"
      value={form.couponCode}
      onChange={e => update("couponCode", e.target.value.toUpperCase())}
    />
</div>


          <div>
            <label className="text-xs text-gray-600">Remark</label>
            <textarea
              rows={2}
              value={form.remark}
              onChange={e => update("remark", e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm text-[#1b180d] bg-white"
            />
          </div>

          <div className="pt-3 border-t space-y-1 text-sm">
  <div className="flex justify-between">
    <span>Subtotal</span>
    <span>₹{subtotal.toFixed(2)}</span>
  </div>

  <div className="flex justify-between">
    <span>Shipping</span>
    <span>₹{Number(form.shippingCharge || 0).toFixed(2)}</span>
  </div>

  {Number(form.discount || 0) > 0 && (
    <div className="flex justify-between text-green-600">
      <span>
        Discount {form.couponCode ? `(${form.couponCode})` : ""}
      </span>
      <span>- ₹{Number(form.discount).toFixed(2)}</span>
    </div>
  )}

  <div className="flex justify-between font-semibold text-base pt-2 border-t">
    <span>Total</span>
    <span>₹{Number.isFinite(total) ? total.toFixed(2) : "0.00"}</span>
  </div>
</div>
        </div>

        {/* FOOTER */}
        <div className="px-4 py-3 border-t">
          <button
            onClick={handleUpdate}
            disabled={saving}
            className="w-full h-9 bg-[#b28c34] text-white rounded-lg text-sm font-semibold disabled:opacity-60"
          >
            {saving ? "Saving..." : "Update Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================== COMPONENTS ================== */

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-xs text-gray-600">{label}</label>
      <input
        {...props}
        className="w-full h-9 border rounded-md px-3 text-sm text-[#1b180d] bg-white disabled:bg-gray-100"
      />
    </div>
  );
}

/**
 * ✅ Number input
 * ❌ No mouse scroll increment
 * ✅ Keyboard typing allowed
 */
function NumberInput({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs text-gray-600">{label}</label>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={e => onChange(e.target.value)}
        onWheel={e => e.target.blur()}   // 🚫 disable scroll change
        className="w-full h-9 border rounded-md px-3 text-sm text-[#1b180d] bg-white"
      />
    </div>
  );
}
