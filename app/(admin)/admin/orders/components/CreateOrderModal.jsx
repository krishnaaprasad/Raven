"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CreateOrderModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    userName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    productName: "",
    quantity: 1,
    price: "",
    shippingCharge: "",
  });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    try {
      const res = await fetch("/api/admin/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed");
      }

      toast.success("Manual order created");
      onCreated?.();
      onClose();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-3">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e7e1cf]">
          <h2 className="text-base font-semibold text-[#1b180d]">
            Create Manual Order
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f3efe6]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BODY */}
        <div className="px-4 py-3 space-y-4 text-sm">

          {/* CUSTOMER */}
          <Section title="Customer">
            <Input placeholder="Name" onChange={(e) => update("userName", e.target.value)} />
            <Input placeholder="Email" onChange={(e) => update("email", e.target.value)} />
            <Input placeholder="Phone" onChange={(e) => update("phone", e.target.value)} />
          </Section>

          {/* ADDRESS */}
          <Section title="Address">
            <Input placeholder="Address" onChange={(e) => update("address", e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="City" onChange={(e) => update("city", e.target.value)} />
              <Input placeholder="State" onChange={(e) => update("state", e.target.value)} />
            </div>
            <Input placeholder="Pincode" onChange={(e) => update("pincode", e.target.value)} />
          </Section>

          {/* PRODUCT */}
          <Section title="Product">
            <Input placeholder="Product name" onChange={(e) => update("productName", e.target.value)} />
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="Qty" type="number" value={form.quantity} onChange={(e) => update("quantity", e.target.value)} />
              <Input placeholder="Price ₹" type="number" onChange={(e) => update("price", e.target.value)} />
              <Input placeholder="Ship ₹" type="number" onChange={(e) => update("shippingCharge", e.target.value)} />
            </div>
          </Section>

        </div>

        {/* FOOTER */}
        <div className="px-4 py-3 border-t border-[#e7e1cf] bg-[#fcfbf8]">
          <button
            onClick={handleSave}
            className="w-full h-9 rounded-lg bg-[#b28c34] text-white text-sm font-semibold hover:bg-[#9a864c]"
          >
            Save Order
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Helpers ---------- */

function Section({ title, children }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-[#6b6654] uppercase">
        {title}
      </p>
      {children}
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full h-9 rounded-md border border-[#e7e1cf] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#b28c34]/50"
    />
  );
}
