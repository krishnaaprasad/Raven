// app/(admin)/admin/orders/[id]/OrderDetailsClient.jsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Printer,
  Mail,
  User,
  Truck,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import { toast } from "react-hot-toast";
import "@/models/User";

const ORDER_FLOW = [
  "Payment Awaiting",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const ORDER_COLORS = {
  "Payment Awaiting": "bg-[#fff4dd] text-[#b28c34]",
  Processing: "bg-[#fff4dd] text-[#b28c34]",
  Shipped: "bg-blue-100 text-blue-700",
  "Out for Delivery": "bg-green-100 text-green-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const PAYMENT_COLORS = {
  PAID: "bg-green-100 text-green-700",
  PENDING: "bg-[#fff4dd] text-[#b28c34]",
  FAILED: "bg-red-100 text-red-700",
  CANCELLED: "bg-red-100 text-red-700",
};

function formatAmount(value) {
  if (!value || isNaN(value)) return "0.00";
  return Number(value).toFixed(2);
}

export default function OrderDetailsClient({ orderFromServer }) {
  const router = useRouter();
  const [order, setOrder] = useState(orderFromServer);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order.order_status);
  const [sendingMail, setSendingMail] = useState(false);
  const { data: session } = useSession();

  const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();

  const subtotal = useMemo(
    () =>
      order.cartItems?.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      ) || 0,
    [order.cartItems]
  );
  const shipping = order.shippingCharge || 0;
  const grandTotal = order.totalAmount || subtotal + shipping;

  const customerType =
    order.userId?.isGuest === true
      ? "Guest User"
      : order.userId
      ? "Registered User"
      : "Guest User";

  const paymentStatus = (order.payment_status || order.status || "PENDING").toUpperCase();
  const paymentBadgeClass =
    PAYMENT_COLORS[paymentStatus] || "bg-gray-100 text-gray-700";

  const currentOrderColor =
    ORDER_COLORS[order.order_status] || "bg-gray-100 text-gray-700";

  const handleUpdateStatus = async () => {
    if (selectedStatus === order.order_status) {
      toast("Status is already up to date.");
      return;
    }

    if (!window.confirm(`Update order status to "${selectedStatus}"?`)) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_status: selectedStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to update order status.");
      } else {
        setOrder(data.order);
        toast.success(`Order status updated to "${selectedStatus}"`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating order status");
    } finally {
      setUpdating(false);
    }
  };

  const handlePrintInvoice = () => {
    window.open(`/api/invoice?orderId=${order._id}`, "_blank");
  };

  const handleSendMailAgain = async () => {
    if (!window.confirm("Send order confirmation email again to customer?")) {
      return;
    }
    setSendingMail(true);
    try {
      const res = await fetch(`/api/admin/orders/${order._id}/send-mail`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to send email.");
      } else {
        toast.success("Confirmation email sent again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error sending email.");
    } finally {
      setSendingMail(false);
    }
  };

  // Simple fallback timeline
  const history = order.orderHistory || [];

  return (
    <div className="w-full min-h-screen bg-[#fcfbf8] px-4 py-0 lg:px-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-left gap-4">
          <button
            onClick={() => router.push("/admin/orders")}
            className="flex items-center justify-center p-2 rounded-lg hover:bg-black/5"
          >
            <ArrowLeft className="w-5 h-5 text-[#1b180d]" />
          </button>
          <div>
            <h1 className="text-xl lg:text-xl font-semibold text-[#1b180d]">
              Order #{order.customOrderId || order._id}
            </h1>
            <p className="text-xs lg:text-sm text-[#6b6654] ">
              Placed on:{" "}
              {createdAt.toLocaleString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintInvoice}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs lg:text-sm font-semibold border border-[#e7e1cf] rounded-lg text-[#1b180d] hover:bg-[#f5f1e6] cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Invoice
          </button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* LEFT: Order + Customer */}
        <div className="space-y-6 lg:col-span-2">
          {/* Products Ordered */}
          <div className="bg-white border border-[#e7e1cf] rounded-xl p-5 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f0e9d9]">
              <h3 className="text-lg font-bold text-[#1b180d]">
                Products Ordered
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm lg:text-sm text-[#6b6654]">
                  Payment Status:
                </span>
                <span
                  className={`px-2.5 py-1 text-sm font-semibold rounded-full ${paymentBadgeClass}`}
                >
                  {paymentStatus}
                </span>
              </div>
            </div>

            {/* Products Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs lg:text-sm text-left whitespace-nowrap">
                <thead className="bg-[#fcfbf8] text-[11px] uppercase text-[#6b6654]">
                  <tr>
                    <th className="px-3 lg:px-4 py-3">Product</th>
                    <th className="px-3 lg:px-4 py-3 text-center">Quantity</th>
                    <th className="px-3 lg:px-4 py-3 text-right">Unit Price</th>
                    <th className="px-3 lg:px-4 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.cartItems?.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b last:border-b-0 border-[#f0e9d9]"
                    >
                      <td className="px-4 lg:px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 lg:w-14 lg:h-14 rounded-lg overflow-hidden border border-[#f0e9d9] bg-[#f9f4e8]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm lg:text-sm font-medium text-[#1b180d]">
                              {item.name}
                            </p>
                            {item.size && (
                              <p className="text-[12px] text-[#9a864c]">
                                Size: {item.size}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-4 py-4 text-center">
                        {item.quantity}
                      </td>
                      <td className="px-4 lg:px-4 py-4 text-right">
                        ₹{formatAmount(item.price)}
                      </td>
                      <td className="px-4 lg:px-4 py-4 text-right font-semibold">
                        ₹{formatAmount(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="flex justify-end pt-5">
              <div className="w-full max-w-sm space-y-2 text-sm lg:text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6b6654]">Subtotal</span>
                  <span className="text-[#1b180d]">
                    ₹{formatAmount(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b6654]">Shipping</span>
                  <span className="text-[#1b180d]">
                    ₹{formatAmount(shipping)}
                  </span>
                </div>
                {/* If you add taxes later, compute here */}
                {/* <div className="flex justify-between">
                  <span className="text-[#6b6654]">Taxes</span>
                  <span className="text-[#1b180d]">₹0.00</span>
                </div> */}
                <div className="border-t border-[#f0e9d9] pt-2 mt-2">
                  <div className="flex justify-between font-bold text-[#1b180d]">
                    <span>Grand Total</span>
                    <span>₹{formatAmount(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer + Shipping */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Details */}
            <div className="bg-white border border-[#e7e1cf] rounded-xl p-5 lg:p-6">
              <h3 className="text-lg font-bold text-[#1b180d] mb-4">
                Customer Details
              </h3>
              <div className="space-y-4 text-base">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[#1b180d]">
                    {order.userName}
                  </p>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#f3e7c9] text-[#1b180d]">
                    <User className="w-3 h-3" />
                    {customerType}
                  </span>
                </div>
                <div className="text-sm lg:text-sm text-[#6b6654] space-y-1">
                  <p>{order.email}</p>
                  <p>{order.phone}</p>
                </div>

                <button
                  onClick={handleSendMailAgain}
                  disabled={sendingMail}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm lg:text-sm font-semibold border border-[#e7e1cf] rounded-lg text-[#1b180d] hover:bg-[#f5f1e6] disabled:opacity-60 cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  {sendingMail ? "Sending..." : "Send Confirmation Mail"}
                </button>
              </div>
            </div>

            {/* Billing & Shipping */}
            <div className="bg-white border border-[#e7e1cf] rounded-xl p-5 lg:p-6">
              <h3 className="text-lg font-bold text-[#1b180d] mb-4">
                Billing &amp; Shipping
              </h3>
              <div className="space-y-4 text-sm lg:text-sm text-[#6b6654]">
                <div>
                  <p className="font-semibold text-[#1b180d] mb-1">
                    Shipping Address
                  </p>
                  <p>
                    {order.addressDetails.address1}
                    {order.addressDetails.address2
                      ? `, ${order.addressDetails.address2}`
                      : ""}
                  </p>
                  <p>
                    {order.addressDetails.city}, {order.addressDetails.state}{" "}
                    {order.addressDetails.pincode}
                  </p>
                  <p>India</p>
                </div>

                <div className="pt-3 border-t border-[#f0e9d9]">
                  <p className="font-semibold text-[#1b180d] mb-1">
                    Billing Address
                  </p>
                  <p>Same as shipping address</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Status & History */}
        <div className="space-y-6 lg:col-span-1 ">
          {/* Update Order Status */}
          <div className="bg-white border border-[#e7e1cf] rounded-xl p-5 lg:p-6">
            <h3 className="text-lg font-bold text-[#1b180d] mb-4">
              Update Order Status
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-sm lg:text-sm font-medium text-[#6b6654]">
                  Current Status:
                </span>
                <span
                  className={`px-2.5 py-1 text-sm font-semibold rounded-full ${currentOrderColor}`}
                >
                  {order.order_status}
                </span>
              </div>

              <div className="relative ">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="block w-full rounded-lg border border-[#e7e1cf] bg-[#fcfbf8] text-sm lg:text-sm px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-[#b28c34] cursor-pointer"
                >
                  {ORDER_FLOW.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="w-full mt-1 inline-flex items-center justify-center px-4 py-2.5 text-sm lg:text-sm font-semibold rounded-lg bg-[#b28c34] text-white hover:bg-[#9a864c] disabled:opacity-60 cursor-pointer"
              >
                {updating ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>

          {/* Order History */}
          <div className="bg-white border border-[#e7e1cf] rounded-xl p-5 lg:p-6">
            <h3 className="text-lg font-bold text-[#1b180d] mb-4">
              Order History
            </h3>

            {history.length === 0 ? (
              <p className="text-sm lg:text-sm text-[#6b6654]">
                No manual status updates yet. Order placed on{" "}
                {createdAt.toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                .
              </p>
            ) : (
              <div className="relative pl-3">
                <div className="absolute left-3 top-1 bottom-1 border-l-2 border-dashed border-[#e7e1cf]" />
                <div className="space-y-4">
                  {history
                    .slice()
                    .reverse()
                    .map((h, idx) => (
                      <div
                        key={idx}
                        className="relative flex items-start gap-3 pl-2"
                      >
                        <div className="z-10 mt-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-[#b28c34] text-white text-[10px] ring-4 ring-[#fcfbf8]">
                          {h.to === "Shipped" || h.to === "Out for Delivery" ? (
                            <Truck className="w-3 h-3" />
                          ) : h.to === "Delivered" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock3 className="w-3 h-3" />
                          )}
                        </div>
                        <div className="text-sm lg:text-sm">
                          <p className="font-semibold text-[#1b180d]">
                            {h.from} → {h.to}
                          </p>
                          <p className="text-[11px] text-[#6b6654]">
                            {h.at
                              ? new Date(h.at).toLocaleString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                            {h.by && ` · by ${session?.user?.name || "Loading..."}`}
                          </p>
                          {h.note && (
                            <p className="text-[11px] text-[#9a864c] mt-1">
                              {h.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile print button at bottom */}
      <div className="mt-6 sm:hidden ">
        <button
          onClick={handlePrintInvoice}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold border border-[#e7e1cf] rounded-lg text-[#1b180d] hover:bg-[#f5f1e6] cursor-pointer"
        >
          <Printer className="w-4 h-4 " />
          Print Invoice
        </button>
      </div>
    </div>
  );
}
