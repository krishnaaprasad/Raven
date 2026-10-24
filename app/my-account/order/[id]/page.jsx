"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/app/context/cartcontext";
import { Playfair_Display, Manrope } from "next/font/google";
import Link from "next/link";
import { useParams } from "next/navigation";
import AppImage from "@/components/ui/AppImage";

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
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Reset when the id changes and ignore responses for a previous id
    let active = true;
    setOrder(null);
    setNotFound(false);
    setLoadError(false);

    const fetchOrder = async () => {
      // Network/parse/server failures are retryable; only 401/404 mean "not found"
      let res, data;
      try {
        res = await fetch(`/api/order/${id}`, { cache: "no-store" });
        data = await res.json();
      } catch {
        if (active) setLoadError(true);
        return;
      }
      if (!active) return;

      if (data?.success) {
        setOrder(data.order);
      } else if (res.status === 404 || res.status === 401) {
        setNotFound(true);
      } else {
        setLoadError(true);
      }
    };
    fetchOrder();
    return () => {
      active = false;
    };
  }, [id, reloadKey]);

  if (!order)
    return (
      <div className="p-6 text-center font-medium text-(--theme-text)">
        {notFound ? (
          "Order not found. Please log in with the number used for this order."
        ) : loadError ? (
          <>
            <p className="mb-3">Couldn&apos;t load this order. Please check your connection.</p>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="px-4 py-2 text-sm border border-(--theme-border) rounded-lg hover:bg-(--theme-soft)"
            >
              Try again
            </button>
          </>
        ) : (
          "Loading order..."
        )}
      </div>
    );
   // Always cast to Number (handles string, Decimal128, etc.)
const subtotal = order.cartItems.reduce(
  (sum, item) =>
    sum + Number(item.price || 0) * Number(item.quantity || 0),
  0
);

const shipping = Number(order.shippingCharge || 0);
const discount = Number(order.discount || 0);

// IMPORTANT → Use database total as source of truth
const total = Number(order.totalAmount || 0);

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
    <div className="max-w-4xl mx-auto p-6 mt-6 mb-20 bg-(--theme-bg) text-(--theme-text) rounded-2xl border border-(--theme-border) shadow-sm transition-colors duration-300">
      
      {/* Back Button */}
      <Link
        href="/my-account?tab=Orders"
        className="text-sm text-(--theme-muted) hover:text-(--theme-text) hover:underline mb-4 inline-block transition"
      >
        ← Back to Orders
      </Link>

      {/* Title */}
      <h2
        className={`${playfair.className} text-3xl font-semibold text-(--theme-text) mb-6`}
      >
        Order #{order.customOrderId || order._id}
      </h2>

      {/* Status + Payment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-(--theme-soft) rounded-lg p-4 border border-(--theme-border)">
          <p className="text-sm text-(--theme-muted)">Order Status</p>
          <p className="font-medium text-(--theme-text)">{order.order_status}</p>
        </div>

        <div className="bg-(--theme-soft) rounded-lg p-4 border border-(--theme-border)">
          <p className="text-sm text-(--theme-muted)">Payment Status</p>
          <p className="font-medium text-(--theme-text)">{order.status}</p>
        </div>

        <div className="bg-(--theme-soft) rounded-lg p-4 border border-(--theme-border)">
          <p className="text-sm text-(--theme-muted)">Order Date</p>
          <p className="font-medium text-(--theme-text)">
            {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })}
          </p>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="bg-(--theme-soft) p-5 rounded-lg border border-(--theme-border) mb-6">
        <h3
          className={`${playfair.className} text-xl font-semibold text-(--theme-text) mb-3`}
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
      <div className="bg-(--theme-soft) p-5 rounded-lg border border-(--theme-border) mb-6">
        <h3
          className={`${playfair.className} text-xl font-semibold text-(--theme-text) mb-3`}
        >
          Items
        </h3>

        {order.cartItems.map((item, i) => (
          <div
            key={i}
            className="flex justify-between items-center py-4 border-b border-(--theme-border)"
          >
            <div className="flex gap-4">
              <div className="w-20 h-20 shrink-0 overflow-hidden rounded-md border border-(--theme-border)">
                <AppImage src={item.image} alt={item.name} sizes="80px" className="object-cover" />
              </div>
              <div>
                <p className="font-semibold text-(--theme-text)">{item.name}</p>
                <p className="text-sm text-(--theme-muted)">{item.size}</p>
                <p className="text-sm">
                  Qty: <strong>{item.quantity}</strong>
                </p>
              </div>
            </div>

            <p className="font-semibold text-(--theme-text)">
              ₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-(--theme-soft) p-5 rounded-lg border border-(--theme-border)">
        <h3
          className={`${playfair.className} text-xl font-semibold text-(--theme-text) mb-3`}
        >
          Order Summary
        </h3>

        <div className="text-sm text-(--theme-text) space-y-2">

  <div className="flex justify-between">
    <span>Subtotal</span>
    <span>₹{subtotal.toFixed(2)}</span>
  </div>

  <div className="flex justify-between">
    <span>Shipping</span>
    <span>₹{shipping.toFixed(2)}</span>
  </div>

  {discount > 0 && (
    <div className="flex justify-between text-green-600 font-medium">
      <span>
        Discount
        {order.couponCode && (
          <span className="ml-1 text-xs text-(--theme-muted)">
            ({order.couponCode})
          </span>
        )}
      </span>
      <span>- ₹{discount.toFixed(2)}</span>
    </div>
  )}

  <div className="border-t border-(--theme-border) pt-2 mt-2 flex justify-between font-bold text-lg">
    <span>Total</span>
    <span>₹{total.toFixed(2)}</span>
  </div>

  {discount > 0 && (
    <p className="text-xs text-green-600 mt-1">
      You saved ₹{discount.toFixed(2)} on this order 🎉
    </p>
  )}

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
          href="/my-account?tab=Orders"
          className="px-6 py-3 rounded-lg border border-(--theme-border) text-(--theme-text) hover:bg-(--theme-dark) hover:text-(--theme-bg) transition w-full md:w-auto text-center"
        >
          Back to Orders
        </Link>
      </div>
    </div>
  );
}
