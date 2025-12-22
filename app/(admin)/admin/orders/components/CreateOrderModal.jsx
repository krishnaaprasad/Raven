"use client";

import { useEffect, useState, useMemo } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";

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
    productId: "",
    variantSize: "",
    quantity: 1,
    shippingCharge: "",
    paymentMethod: "Cash",
    price: "",
    remark: "",
  });

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/products?limit=1000");
      const json = await res.json();
      if (json.success) setProducts(json.data || []);
    })();
  }, []);

  const product = products.find(p => p._id === form.productId);
  const variant = product?.variants?.find(v => v.size === form.variantSize);

  useEffect(() => {
    if (variant?.price != null) {
      update("price", variant.price);
    }
  }, [variant]);


  const total = useMemo(() => {
    const qty = Number(form.quantity || 1);
    const price = Number(form.price || 0);
    const ship = Number(form.shippingCharge || 0);
    return qty * price + ship;
  }, [form]);

  const handleSave = async () => {
    try {
      const res = await fetch("/api/admin/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success("Manual order created");
      onCreated?.();
      onClose();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-3">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl">

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

          {/* PRODUCT */}
          <Select
            label="Product*"
            value={form.productId}
            onChange={e => {
              update("productId", e.target.value);
              update("variantSize", "");
            }}
          >
            <option value="">Select product</option>
            {products.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </Select>

          {/* VARIANT */}
          {product && (
            <Select
              label="Variant*"
              value={form.variantSize}
              onChange={e => update("variantSize", e.target.value)}
            >
              <option value="">Select size</option>
              {product.variants.map(v => (
                <option key={v.size} value={v.size}>
                  {v.size} — ₹{v.price}
                </option>
              ))}
            </Select>
          )}

          <div className="grid grid-cols-3 gap-2">
            <Input type="number" label="Qty" value={form.quantity}
              onChange={e => update("quantity", e.target.value)} />
            <Input type="number" label="Shipping"
              onChange={e => update("shippingCharge", e.target.value)} />
            <Input
              type="number"
              label="Price"
              value={form.price}
              onChange={e => update("price", e.target.value)}
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
          </Select>
          
          <div>
            <label className="text-xs text-gray-600">Remark / Note</label>
            <textarea
              rows={3}
              value={form.remark}
              onChange={e => update("remark", e.target.value)}
              placeholder="Any internal note (sold by, special request, etc.)"
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-between font-semibold pt-2">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-4 py-3 border-t">
          <button
            onClick={handleSave}
            className="w-full h-9 bg-[#b28c34] text-white rounded-lg text-sm font-semibold"
          >
            Save Order
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      {label && <label className="text-xs text-gray-600">{label}</label>}
      <input {...props} className="w-full h-9 border rounded-md px-3 text-sm" />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div>
      {label && <label className="text-xs text-gray-600">{label}</label>}
      <select {...props} className="w-full h-9 border rounded-md px-3 text-sm">
        {children}
      </select>
    </div>
  );
}
