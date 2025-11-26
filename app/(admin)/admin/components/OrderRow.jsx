"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast";

// ORDER STATUS COLORS
const ORDER_COLORS = {
  "Payment Awaiting": "bg-[#fff4dd] text-[#b28c34]",
  Processing: "bg-[#fff4dd] text-[#b28c34]",
  Shipped: "bg-blue-100 text-blue-700",
  "Out for Delivery": "bg-green-100 text-green-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

// PAYMENT STATUS BADGE
function PaymentBadge({ status }) {
  const s = (status || "").toUpperCase();
  const style =
    s === "PAID"
      ? "bg-green-100 text-green-700"
      : s === "FAILED" || s === "CANCELLED"
      ? "bg-red-100 text-red-700"
      : s === "PENDING"
      ? "bg-[#fff4dd] text-[#b28c34]"
      : "bg-gray-200 text-gray-700";

  return (
    <span className={`px-2.5 py-[3px] rounded-full text-[11px] font-medium inline-flex items-center ${style}`}>
      {s || "NA"}
    </span>
  );
}

export default function OrderRow({ order, onStatusUpdated }) {
  const allowed = [
    "Processing",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];

  const [saving, setSaving] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(order.order_status || "Processing");
  const [open, setOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const dropdownRef = useRef(null);

  // Close dropdown outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // When user selects an option from dropdown
  const handleStatusSelect = (value) => {
    if (value === currentStatus) return setOpen(false);

    setSelectedStatus(value);
    setConfirmModal(true); // show popup
    setOpen(false); // close dropdown
  };

  const handleUpdateStatus = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_status: selectedStatus }),
      });

      const data = await res.json();
      if (data.success) {
        setCurrentStatus(selectedStatus);
        onStatusUpdated?.(selectedStatus);
        toast.success(`Status updated to ${selectedStatus}`);
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating status");
    }

    setSaving(false);
    setConfirmModal(false);
  };

  const displayId = `#${order.customOrderId || order._id}`;
  const createdAt = new Date(order.createdAt).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const amount = Number(order.totalAmount || 0).toLocaleString("en-IN");
  const customerType = order.userId ? "Logged User" : "Guest User";

  return (
  <>
    <tr className="hover:bg-[#fff9eb] transition border-b border-[#e7e1cf] text-[13px]">
      <td className="px-5 py-3 font-semibold text-[#1b180d] min-w-[130px]">
        {displayId}
      </td>

      <td className="px-5 py-3 min-w-[170px]">
        <div className="flex flex-col leading-tight">
          <span className="font-semibold text-[14px] text-[#1b180d]">
            {order.userName}
          </span>
          <span className="text-[11px] text-[#8b8b8b]">{customerType}</span>
        </div>
      </td>

      <td className="px-5 py-3 whitespace-nowrap min-w-[150px]">{createdAt}</td>

      <td className="px-5 py-3 font-semibold">₹{amount}</td>

      <td className="px-5 py-3">
        <PaymentBadge status={order.payment_status || order.status} />
      </td>

      {/* STATUS DROPDOWN */}
      <td className="px-5 py-3 min-w-[120px] relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center justify-between w-[140px] px-3 py-1.5 text-[12px] border border-[#b28c34] text-[#1b180d] rounded-lg hover:bg-[#fff4dd]"
        >
          <span
            className={`px-2 py-[2px] rounded-full font-medium ${ORDER_COLORS[currentStatus]}`}
          >
            {currentStatus}
          </span>
          <ChevronDown size={14} className="text-[#b28c34]" />
        </button>

        {open && (
          <div className="absolute mt-2 w-[160px] bg-white border border-[#e7e1cf] rounded-lg shadow-lg z-40">
            {allowed.map((s) => (
              <div
                key={s}
                className="px-3 py-2 text-[12px] cursor-pointer hover:bg-[#fff4dd]"
                onClick={() => handleStatusSelect(s)}
              >
                {s}
              </div>
            ))}
          </div>
        )}
      </td>

      <td className="px-5 py-3 text-left min-w-[110px]">
        <a
          href={`/admin/orders/${order._id}`}
          className="text-[#b28c34] text-[13px] font-medium hover:underline"
        >
          View Details
        </a>
      </td>
    </tr>

    {/* MODAL OUTSIDE tbody (fixes hydration issue) */}
    {confirmModal && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl w-[350px] shadow-xl text-center">
          <h3 className="text-lg font-semibold text-[#1b180d] mb-2">
            Confirm Update
          </h3>
          <p className="text-sm text-[#6b6654] mb-4">
            Do you want to update status to <b>{selectedStatus}</b>?
          </p>

          <div className="flex justify-center gap-4">
            <button
              className="px-4 py-2 rounded-lg bg-[#b28c34] text-white"
              onClick={handleUpdateStatus}
            >
              Yes, Update
            </button>

            <button
              className="px-4 py-2 rounded-lg border border-[#e7e1cf]"
              onClick={() => setConfirmModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);
}
