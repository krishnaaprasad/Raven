"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      const res = await fetch("/api/order/user");
      const data = await res.json();
      if (data.success) setOrders(data.orders);
      setLoading(false);
    };
    loadOrders();
  }, []);

  if (loading) {
    return <p className="text-[#9a864c]">Loading your orders…</p>;
  }

  if (orders.length === 0) {
    return <p>You haven't placed any orders yet.</p>;
  }

  return (
    <div className="flex flex-col gap-6 mt-4">

      {orders.map((order) => (
        <div
          key={order._id}
          className="bg-white rounded-xl border border-[#e7e1cf] shadow-sm overflow-hidden flex flex-col sm:flex-row"
        >
          {/* LEFT: IMAGE + TEXT WRAPPER */}
          <div className="p-6 flex-1 flex flex-col sm:flex-row items-start gap-6">

            {/* PRODUCT THUMBNAIL */}
            <div className="w-20 h-20 flex-shrink-0">
              <img
                src={order.cartItems[0]?.image}
                className="w-20 h-20 object-cover rounded-lg border"
                alt="Product"
              />
            </div>

            {/* ORDER INFO */}
            <div className="flex-1 flex flex-col justify-between gap-3">

              {/* ORDER TITLE + STATUS */}
              <div className="flex justify-between items-start gap-4">
                <h2 className="text-lg font-bold text-[#1b180d]">
                  Order #{order.customOrderId || order._id}
                </h2>

                {/* STATUS BADGE */}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium 
                  ${
                    order.status === "PAID"
                      ? "bg-green-100 text-green-700"
                      : order.status === "SHIPPED"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {/* DETAILS GRID */}
              <div className="grid grid-cols-2 gap-x-6 text-sm">
                <span className="text-[#6b6654]">Order Date</span>
                <span className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString("en-IN")}
                </span>

                <span className="text-[#6b6654]">Total Amount</span>
                <span className="font-bold">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: BUTTON */}
          <div className="bg-[#f8f3df] p-6 flex items-center justify-center sm:w-40">
            <Link
              href={`/my-account/order/${order._id}`}
              className="bg-[#b28c34] text-white w-full text-center rounded-lg py-2 font-bold hover:brightness-110 transition"
            >
              View Details
            </Link>
          </div>
        </div>
      ))}

    </div>
  );
}
