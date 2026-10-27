"use client";

import { useEffect, useState, useMemo } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import OrderItemsEditor, { emptyItem, itemsSubtotal } from "./OrderItemsEditor";

export default function CreateOrderModal({ onClose, onCreated }) {
  const INDIAN_STATES = [
  "Andhra Pradesh","Andaman and Nicobar Islands", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh","Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu","Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir","Jharkhand",
  "Karnataka", "Kerala","Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha",   "Puducherry", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    orderDate: new Date().toISOString().slice(0, 10),
    userName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    shippingCharge: "",
      // ✅ ADD THESE
    discount: "",
    couponCode: "",
    paymentMethod: "Cash",
    remark: "",
  });
  const [items, setItems] = useState([emptyItem()]);
  const [saving, setSaving] = useState(false);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/products?limit=1000");
      const json = await res.json();
      if (json.success) setProducts(json.data || []);
    })();
  }, []);

  const subtotal = useMemo(() => itemsSubtotal(items), [items]);

  const total = useMemo(() => {
    const ship = Number(form.shippingCharge || 0);
    const discount = Number(form.discount || 0);
    return Math.max(0, subtotal + ship - discount);
  }, [form, subtotal]);

  const handleSave = async () => {
    if (saving) return; // no double submit (would create two orders)
    try {
      if (!form.userName.trim() || !form.phone.trim()) {
        toast.error("Customer name and phone are required");
        return;
      }
      if (items.some((it) => !it.slug || !it.variantSize)) {
        toast.error("Choose a product and size on every row");
        return;
      }
      const sub = subtotal;
      const discountVal = Number(form.discount || 0);
      if (discountVal < 0) {
        toast.error("Discount cannot be negative");
        return;
      }
      if (discountVal > sub) {
        toast.error("Discount cannot exceed subtotal");
        return;
      }
      setSaving(true);
      const res = await fetch("/api/admin/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success("Manual order created");
      onCreated?.();
      onClose();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-3">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl text-[#1b180d]">

        {/* HEADER */}
        <div className="flex justify-between px-4 py-3 border-b">
          <h2 className="text-sm font-semibold">Create Manual Order</h2>
          <button onClick={onClose}><X size={16} /></button>
        </div>

        {/* BODY */}
        <div className="px-4 py-3 space-y-3 text-sm max-h-[70vh] overflow-y-auto">

          <Input type="date" label="Order Date" value={form.orderDate}
            onChange={e => update("orderDate", e.target.value)} />

          <Input label="Customer Name*" onChange={e => update("userName", e.target.value)} />
          <Input label="Phone*" onChange={e => update("phone", e.target.value)} />
          <Input label="Email" onChange={e => update("email", e.target.value)} />
          <Input label="Address" onChange={e => update("address", e.target.value)} />

          <div className="grid grid-cols-2 gap-2">
            <Input label="City" onChange={e => update("city", e.target.value)} />

            <Select
              label="State"
              value={form.state}
              onChange={e => update("state", e.target.value)}
            >
              <option value="">Select state</option>
              {INDIAN_STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>

          <Input label="Pincode" onChange={e => update("pincode", e.target.value)} />

          {/* PRODUCTS (one row = single-product order) */}
          <OrderItemsEditor products={products} items={items} onChange={setItems} />

          <div className="grid grid-cols-2 gap-2">
            <Input type="number" label="Shipping"
              onChange={e => update("shippingCharge", e.target.value)} />
            <Input
              type="number"
              label="Discount"
              value={form.discount}
              onChange={e => update("discount", e.target.value)}
            />

            <Input
              label="Coupon Code"
              value={form.couponCode}
              onChange={e => update("couponCode", e.target.value.toUpperCase())}
            />
          </div>

          <Select
            label="Payment Method"
            value={form.paymentMethod}
            onChange={e => update("paymentMethod", e.target.value)}
          >
            <option>Cash</option>
            <option>UPI</option>
            <option>Bank Transfer</option>
            <option>FOC</option>
          </Select>
          
          <div>
            <label className="text-xs text-gray-600">Remark / Note</label>
            <textarea
              rows={3}
              value={form.remark}
              onChange={e => update("remark", e.target.value)}
              placeholder="Any internal note (sold by, special request, etc.)"
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
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-4 py-3 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-9 bg-[#b28c34] text-white rounded-lg text-sm font-semibold disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, type, ...props }) {
  return (
    <div>
      {label && <label className="text-xs text-gray-600">{label}</label>}
      <input
        {...props}
        type={type}
        inputMode={type === "number" ? "numeric" : undefined}
        onWheel={type === "number" ? e => e.target.blur() : undefined}
        className="w-full h-9 border rounded-md px-3 text-sm text-[#1b180d] bg-white"
      />
    </div>
  );
}



function Select({ label, children, ...props }) {
  return (
    <div>
      {label && <label className="text-xs text-gray-600">{label}</label>}
      <select {...props} className="w-full h-9 border rounded-md px-3 text-sm text-[#1b180d] bg-white">
        {children}
      </select>
    </div>
  );
}
