"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";  // ⭐ FIX FOR MODAL OUTSIDE TBODY
import { ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast";
import { Eye, Pencil, Trash2 } from "lucide-react";


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
  const [showDelete, setShowDelete] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");


  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleStatusSelect = (value) => {
    if (value === currentStatus) return setOpen(false);

    setSelectedStatus(value);
    setConfirmModal(true);
    setOpen(false);
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

const displayId =
  order.manualOrderId
    ? order.manualOrderId
    : `#${order.customOrderId || order._id.toString().slice(-6)}`;

  const createdAt = new Date(order.createdAt).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const amount = Number(order.totalAmount || 0).toLocaleString("en-IN");
const customerType =
  order.userId
    ? order.userId.isGuest
      ? "Guest User"
      : "Logged User"
    : "Guest User";



  return (
    <>
      <tr className="hover:bg-[#fff9eb] transition border-b border-[#e7e1cf] text-[13px]">
        <td className="px-5 py-3 font-semibold text-[#1b180d] min-w-[130px]">
          {displayId}
        </td>

        <td className="px-5 py-3 min-w-[170px]">
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-[14px] text-[#1b180d]">{order.userName}</span>
            <span className="text-[11px] text-[#8b8b8b]">{customerType}</span>
          </div>
        </td>

        <td className="px-5 py-3 whitespace-nowrap min-w-[150px]">{createdAt}</td>

        <td className="px-5 py-3 font-semibold">₹{amount}</td>

        <td className="px-5 py-3">
          {(() => {
            const status = (order.payment_status || order.status || "PENDING").toUpperCase();
            const rawMethod = order.paymentMethod || "";
            const method =
              typeof rawMethod === "string"
                ? rawMethod.split(" ")[0].toUpperCase()
                : "";

            let label = status;
            if (status === "PAID" && method) {
              label = `${status} - ${method}`;
            }

            const style =
              status === "PAID"
                ? "bg-green-100 text-green-700"
                : status === "FAILED" || status === "CANCELLED"
                ? "bg-red-100 text-red-700"
                : "bg-[#fff4dd] text-[#b28c34]";

            return (
              <span
                className={`px-2.5 py-[3px] rounded-full text-[11px] font-medium inline-flex items-center ${style}`}
              >
                {label}
              </span>
            );
          })()}
        </td>

        {/* DROPDOWN */}
        <td className="px-5 py-3 min-w-[120px] relative " ref={dropdownRef} >
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center justify-between w-[140px] px-3 py-1.5 text-[12px] border border-[#b28c34] text-[#1b180d] rounded-lg hover:bg-[#fff4dd] cursor-pointer"
          >
            <span className={`px-2 py-0.5 rounded-full font-medium ${ORDER_COLORS[currentStatus]}`}>{currentStatus}</span>
            <ChevronDown size={14} className="text-[#b28c34]" />
          </button>

          {open && (
            <div
              className={`absolute w-40 bg-white border border-[#e7e1cf] rounded-lg shadow-lg z-40 cursor-pointer
                ${dropdownRef.current?.getBoundingClientRect().bottom + 180 > window.innerHeight
                  ? "bottom-full mb-2"
                  : "mt-2"
                }
              `}
            >
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

        <td className="px-5 py-3 min-w-[120px]">
          <div className="flex items-center gap-3">
            {/* View */}
            <a href={`/admin/orders/${order._id}`} title="View">
              <Eye className="w-5 h-5 text-[#b28c34] hover:scale-110 transition" />
            </a>

            {/* Edit */}
            <a href={`/admin/orders/${order._id}?edit=true`} title="Edit">
              <Pencil className="w-5 h-5 text-blue-600 hover:scale-110 transition" />
            </a>

            {/* Delete */}
            <button onClick={() => setShowDelete(true)} title="Delete">
              <Trash2 className="w-5 h-5 text-red-600 hover:scale-110 transition" />
            </button>
          </div>
        </td>
      </tr>

      {/* PORTAL — FIXES HYDRATION ERROR */}
      {confirmModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-[350px] shadow-xl text-center">
              <h3 className="text-lg font-semibold text-[#1b180d] mb-2">Confirm Update</h3>
              <p className="text-sm text-[#6b6654] mb-4">
                Do you want to update status to <b>{selectedStatus}</b>?
              </p>
              <div className="flex justify-center gap-4">
                <button className="px-4 py-2 rounded-lg bg-[#b28c34] text-white cursor-pointer" onClick={handleUpdateStatus}>
                  Yes, Update
                </button>
                <button className="px-4 py-2 rounded-lg border border-[#e7e1cf] cursor-pointer" onClick={() => setConfirmModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {showDelete &&
          createPortal(
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl w-[380px] shadow-xl">
                <h3 className="text-lg font-semibold text-[#1b180d] mb-2">
                  Delete Order
                </h3>
                <p className="text-sm text-[#6b6654] mb-3">
                  Please provide a reason for deleting this order.
                </p>

                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Reason..."
                  className="w-full border border-[#e7e1cf] rounded-lg p-2 text-sm mb-4"
                  rows={3}
                />

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDelete(false)}
                    className="px-4 py-2 rounded-lg border border-[#e7e1cf]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!deleteReason.trim()) {
                        toast.error("Reason is required");
                        return;
                      }
                      try {
                        const res = await fetch(`/api/admin/orders/${order._id}`, {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ reason: deleteReason }),
                        });
                        const data = await res.json();
                        if (data.success) {
                          toast.success("Order deleted");
                          setShowDelete(false);
                          onStatusUpdated?.();
                        } else {
                          toast.error(data.error || "Delete failed");
                        }
                      } catch {
                        toast.error("Error deleting order");
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
    </>
  );
}
