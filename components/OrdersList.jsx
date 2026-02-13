// app/components/OrdersList.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Crimson_Text } from "next/font/google";

const crimson = Crimson_Text({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
        <p className="text-center text-(--theme-muted)">Loading your orders…</p>
      </div>
    );
  }
  
  if (!orders.length) {
    return (
      <div className="py-6">
        <p className="text-center text-(--theme-muted)">You haven't placed any orders yet.</p>
      </div>
    );
  }

    const statusBadge = (status) => {
    const s = (status || "").toLowerCase();

    let label = "Processing";
    let symbol = "⏳";

    if (s === "delivered") {
      label = "Delivered";
      symbol = "✓";
    } else if (s === "shipped") {
      label = "Shipped";
      symbol = "🚚";
    } else if (s === "out for delivery") {
      label = "Out for Delivery";
      symbol = "📦";
    } else if (s === "processing") {
      label = "Processing";
      symbol = "⏳";
    } else if (s === "payment awaiting") {
      label = "Payment Awaiting";
      symbol = "💳";
    } else if (s === "cancelled" || s === "failed") {
      label = "Cancelled";
      symbol = "✕";
    }

    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-(--theme-border) bg-(--theme-soft) text-(--theme-text) text-sm font-medium">
        <span className="text-base leading-none">{symbol}</span>
        <span>{label}</span>
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
            className="bg-(--theme-bg) rounded-xl border border-(--theme-border) shadow-sm flex flex-col sm:flex-row overflow-hidden transition-colors duration-300"
          >
            {/* DESKTOP IMAGE */}
            <div className="hidden sm:flex items-center justify-center w-40 p-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden shadow border border-(--theme-border)">
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
                <h3 className={`${crimson.className} text-lg font-bold text-[var(--theme-text)]`}>
                  Order #{orderId}
                </h3>
                <div>{statusBadge(order.order_status || order.status)}</div>
              </div>

              <div className="grid grid-cols-2 gap-y-1 text-sm">
                <p className="text-(--theme-muted)">Order Date</p>
                <p className="text-(--theme-text) font-medium">
                  {created.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>

                <p className="text-(--theme-muted)">Total Amount</p>
                <p className="text-(--theme-text) font-bold">
                  ₹{order.totalAmount?.toFixed(2)}
                </p>
              </div>
            </div>

            {/* RIGHT BUTTON (DESKTOP) + FULL WIDTH (MOBILE) */}
            <div className="bg-(--theme-soft) sm:w-48 flex items-center justify-center px-5 py-4 border-t sm:border-t-0 sm:border-l border-(--theme-border)">
              <button
                onClick={() => router.push(`/my-account?tab=Orders&orderId=${order._id}`)}
                className="w-full text-center py-3 rounded-lg bg-(--theme-text) text-(--theme-bg) font-semibold text-sm hover:opacity-90 transition-all"
              >
                View Details
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
