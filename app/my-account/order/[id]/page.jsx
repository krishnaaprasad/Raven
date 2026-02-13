"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/app/context/cartcontext";
import { Playfair_Display, Manrope } from "next/font/google";
import Link from "next/link";
import { useParams } from "next/navigation";
// import usePageMetadata from '../hooks/usePageMetadata';

// export const usePageMetadata = {
//   title: "Order Details - Raven Fragrance",
//   description: "View your complete order details on Raven Fragrance",
// };

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "600", "700"] });
const manrope = Manrope({ subsets: ["latin"] });

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id;
  const { addToCart } = useCart();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const res = await fetch(`/api/order/${id}`);
      const data = await res.json();

      if (data.success) setOrder(data.order);
    };
    fetchOrder();
  }, [id]);

  if (!order)
    return (
      <p className="p-6 text-center font-medium text-[var(--theme-text)]">
        Loading order...
      </p>
    );

  const handleReorder = () => {
    order.cartItems.forEach((item) => {
      addToCart({
        id: item._id,
        name: item.name,
        price: item.price,
        image: item.image,
        size: item.size,
        quantity: item.quantity,
      });
    });
    window.location.href = "/Cart";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-6 mb-20 bg-[var(--theme-bg)] text-[var(--theme-text)] rounded-2xl border border-[var(--theme-border)] shadow-sm transition-colors duration-300">
      
      {/* Back Button */}
      <Link
        href="/account/orders"
        className="text-sm text-(--theme-muted) hover:text-[var(--theme-text)] hover:underline mb-4 inline-block transition"
      >
        ← Back to Orders
      </Link>

      {/* Title */}
      <h2
        className={`${playfair.className} text-3xl font-semibold text-[var(--theme-text)] mb-6`}
      >
        Order #{order.customOrderId || order._id}
      </h2>

      {/* Status + Payment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[var(--theme-soft)] rounded-lg p-4 border border-[var(--theme-border)]">
          <p className="text-sm text-(--theme-muted)">Order Status</p>
          <p className="font-medium text-[var(--theme-text)]">{order.order_status}</p>
        </div>

        <div className="bg-[var(--theme-soft)] rounded-lg p-4 border border-[var(--theme-border)]">
          <p className="text-sm text-(--theme-muted)">Payment Status</p>
          <p className="font-medium text-[var(--theme-text)]">{order.status}</p>
        </div>

        <div className="bg-[var(--theme-soft)] rounded-lg p-4 border border-[var(--theme-border)]">
          <p className="text-sm text-(--theme-muted)">Order Date</p>
          <p className="font-medium text-[var(--theme-text)]">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="bg-[var(--theme-soft)] p-5 rounded-lg border border-[var(--theme-border)] mb-6">
        <h3
          className={`${playfair.className} text-xl font-semibold text-[var(--theme-text)] mb-3`}
        >
          Delivery Details
        </h3>

        <p className="text-sm"><span className="font-semibold">Name:</span> {order.userName}</p>
        <p className="text-sm"><span className="font-semibold">Phone:</span> {order.phone}</p>
        <p className="text-sm"><span className="font-semibold">Email:</span> {order.email}</p>

        <p className="text-sm mt-2">
          <span className="font-semibold">Address:</span> {order.address}
        </p>

        <div className="mt-2 text-sm">
          <p>{order.addressDetails.address1}</p>
          <p>{order.addressDetails.address2}</p>
          <p>
            {order.addressDetails.city}, {order.addressDetails.state} -{" "}
            {order.addressDetails.pincode}
          </p>
        </div>

        <p className="text-sm mt-2">
          <span className="font-semibold">Delivery Type:</span>{" "}
          {order.deliveryType}
        </p>
      </div>

      {/* Items */}
      <div className="bg-[var(--theme-soft)] p-5 rounded-lg border border-[var(--theme-border)] mb-6">
        <h3
          className={`${playfair.className} text-xl font-semibold text-[var(--theme-text)] mb-3`}
        >
          Items
        </h3>

        {order.cartItems.map((item, i) => (
          <div
            key={i}
            className="flex justify-between items-center py-4 border-b border-[var(--theme-border)]"
          >
            <div className="flex gap-4">
              <img
                src={item.image}
                className="w-20 h-20 rounded-md border border-[var(--theme-border)]"
                alt={item.name}
              />
              <div>
                <p className="font-semibold text-[var(--theme-text)]">{item.name}</p>
                <p className="text-sm text-(--theme-muted)">{item.size}</p>
                <p className="text-sm">
                  Qty: <strong>{item.quantity}</strong>
                </p>
              </div>
            </div>

            <p className="font-semibold text-[var(--theme-text)]">
              ₹{item.price * item.quantity}
            </p>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-[var(--theme-soft)] p-5 rounded-lg border border-[var(--theme-border)]">
        <h3
          className={`${playfair.className} text-xl font-semibold text-[var(--theme-text)] mb-3`}
        >
          Order Summary
        </h3>

        <div className="text-sm text-[var(--theme-text)] space-y-1">
          <p>Subtotal: ₹{order.totalAmount - order.shippingCharge}</p>
          <p>Shipping: ₹{order.shippingCharge}</p>
          <p className="font-bold text-lg mt-2">
            Total: ₹{order.totalAmount}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col md:flex-row gap-4 mt-8">
        <button
          onClick={handleReorder}
          className="bg-(--theme-dark) hover:bg-(--theme-darker) text-(--theme-bg) px-6 py-3 rounded-lg w-full md:w-auto transition"
        >
          Re-Order
        </button>

        <Link
          href="/account/orders"
          className="px-6 py-3 rounded-lg border border-[var(--theme-border)] text-[var(--theme-text)] hover:bg-[var(--theme-dark)] hover:text-(--theme-bg) transition w-full md:w-auto text-center"
        >
          Back to Orders
        </Link>
      </div>
    </div>
  );
}
