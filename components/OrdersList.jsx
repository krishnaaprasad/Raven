// app/components/OrdersList.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await fetch("/api/order/user");
        const data = await res.json();
        if (data?.success) setOrders(data.orders || []);
      } catch (err) {
        console.error("Orders fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="py-6">
        <p className="text-center text-[#9a864c]">Loading your orders…</p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="py-6">
        <p className="text-center text-[#6b6654]">You haven't placed any orders yet.</p>
      </div>
    );
  }

const statusBadge = (status) => {
  const s = (status || "").toLowerCase();

  if (s.includes("delivered") || s.includes("paid")) {
    return (
      <span className="inline-flex flex-row items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium whitespace-nowrap">
        <span className="text-lg leading-none">✓</span>
        <span>Delivered</span>
      </span>
    );
  }

  if (s.includes("shipped")) {
    return (
      <span className="inline-flex flex-row items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium whitespace-nowrap">
        <span className="text-lg leading-none">🚚</span>
        <span>Shipped</span>
      </span>
    );
  }

  return (
    <span className="inline-flex flex-row items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium whitespace-nowrap">
      <span className="text-lg leading-none">⏳</span>
      <span>Processing</span>
    </span>
  );
};


  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const orderId = order.customOrderId || order._id;
        const created = order.createdAt ? new Date(order.createdAt) : new Date();
        const firstImage = order.cartItems?.[0]?.image || "/placeholder.png";

        return (
          <div
            key={order._id}
            className="bg-white rounded-xl border border-[#e7e1cf] shadow-sm flex flex-col sm:flex-row overflow-hidden"
          >
            {/* DESKTOP IMAGE */}
            <div className="hidden sm:flex items-center justify-center w-40 p-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden shadow border border-[#f0ece0]">
                <img
                  src={firstImage}
                  className="w-full h-full object-cover"
                  alt="Product"
                />
              </div>
            </div>

            {/* MOBILE BANNER IMAGE */}
            <div className="block sm:hidden w-full">
              <div className="h-44 w-full overflow-hidden rounded-t-xl">
                <img
                  src={firstImage}
                  className="w-full h-full object-cover"
                  alt="Product"
                />
              </div>
            </div>

            {/* DETAILS */}
            <div className="flex-1 px-6 py-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-[#1b180d] leading-tight">
                  Order #{orderId}
                </h3>
                <div>{statusBadge(order.status)}</div>
              </div>

              <div className="grid grid-cols-2 gap-y-1 text-sm">
                <p className="text-[#6b6654]">Order Date</p>
                <p className="text-[#1b180d] font-medium">
                  {created.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>

                <p className="text-[#6b6654]">Total Amount</p>
                <p className="text-[#1b180d] font-bold">
                  ₹{order.totalAmount?.toFixed(2)}
                </p>
              </div>
            </div>

            {/* RIGHT BUTTON (DESKTOP) + FULL WIDTH (MOBILE) */}
            <div className="bg-[#fff8e1] sm:w-48 flex items-center justify-center px-5 py-4">
              <Link
                href={`/my-account/order/${order._id}`}
                className="w-full text-center py-3 rounded-lg bg-[#eebd2b] text-[#1b180d] font-semibold text-sm hover:brightness-95 transition-all"
              >
                View Details
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
