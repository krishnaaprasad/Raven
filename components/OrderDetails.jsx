"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderDetails({ orderId }) {
  const [order, setOrder] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchOrder = async () => {
      const res = await fetch(`/api/order/${orderId}`);
      const data = await res.json();
      if (data.success) setOrder(data.order);
    };
    fetchOrder();
  }, [orderId]);

  if (!order)
    return <p className="p-4 text-sm text-[#9a864c]">Loading order details...</p>;

  return (
    <div className="flex flex-col lg:flex-row gap-8">

      {/* LEFT SIDE (2/3) */}
      <div className="w-full lg:w-2/3 flex flex-col gap-6">

        <h1 className="text-[28px] font-bold text-[#1b180d]">
          Order #{order.customOrderId}
        </h1>

        {/* Summary Card */}
        <div className="bg-white border border-[#e7e1cf] rounded-xl p-6 flex flex-col md:flex-row justify-between gap-4">
          <div className="grid grid-cols-[120px_1fr] gap-y-3 gap-x-6">
            <p className="text-[#9a864c] text-sm">Order Date</p>
            <p className="text-[#1b180d] text-sm font-semibold">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>

            <p className="text-[#9a864c] text-sm">Order Number</p>
            <p className="text-[#1b180d] text-sm font-semibold">{order.customOrderId}</p>

            <p className="text-[#9a864c] text-sm">Order Status</p>
            <div className="flex items-center gap-2">
              <span className="bg-[#9a864c]/20 text-[#1b180d] text-xs font-bold px-3 py-1 rounded-full">
                {order.order_status}
              </span>
            </div>
          </div>

          <button className="bg-[#b28c34] text-white px-4 py-2 rounded-lg">
            Track Package
          </button>
        </div>

        {/* Items Ordered */}
        <div className="bg-white border border-[#e7e1cf] rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 text-[#1b180d]">Items Ordered</h3>

          <div className="flex flex-col divide-y divide-[#e7e1cf]">
            {order.cartItems.map((item, idx) => (
              <div key={idx} className="flex items-center py-6 gap-4">
                <img src={item.image} className="w-24 h-24 rounded-lg object-cover" />

                <div className="flex-grow">
                  <p className="font-bold text-[#1b180d]">{item.name}</p>
                  <p className="text-sm text-[#6b6654]">{item.size}</p>
                  <p className="text-sm text-[#6b6654]">Qty: {item.quantity}</p>
                </div>

                <p className="font-semibold text-[#1b180d]">
                  ₹{item.price * item.quantity}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT SIDE (1/3) */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">

        {/* Address */}
        <div className="bg-white border border-[#e7e1cf] rounded-xl p-6">
          <h3 className="text-lg font-bold mb-3 text-[#1b180d]">Shipping Address</h3>
          <p className="font-semibold">{order.userName}</p>
          <p>{order.address}</p>
          <p>{order.addressDetails.city}, {order.addressDetails.state}</p>
          <p>{order.addressDetails.pincode}</p>
          <p>{order.phone}</p>
        </div>

        {/* Payment Method */}
        <div className="bg-white border border-[#e7e1cf] rounded-xl p-6">
          <h3 className="text-lg font-bold mb-3 text-[#1b180d]">Payment Method</h3>
          <p className="text-sm text-[#6b6654]">
            Paid via {order.paymentMethod.method || "Cashfree"}
          </p>
        </div>

        {/* Summary */}
        <div className="bg-white border border-[#e7e1cf] rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4 text-[#1b180d]">Order Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <p className="text-[#6b6654]">Subtotal</p>
              <p>₹{order.totalAmount - order.shippingCharge}</p>
            </div>

            <div className="flex justify-between">
              <p className="text-[#6b6654]">Shipping</p>
              <p>₹{order.shippingCharge}</p>
            </div>

            <div className="border-t border-[#e7e1cf] my-3"></div>

            <div className="flex justify-between text-base font-bold">
              <p className="text-[#1b180d]">Grand Total</p>
              <p>₹{order.totalAmount}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
