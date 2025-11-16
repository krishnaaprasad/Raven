"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/app/context/cartcontext";


export default function OrderDetailPage({ params }) {
  const { id } = params;
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

  if (!order) return <p className="p-6">Loading order...</p>;

  const handleReorder = () => {
    order.cartItems.forEach((item) => {
      addToCart({
        id: item._id,
        name: item.name,
        price: item.price,
        image: item.image,
        size: item.size,
        quantity: item.quantity
      });
    });
    window.location.href = "/Cart"; // redirect to cart
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">
        Order #{order.customOrderId || order._id}
      </h2>

      <h3 className="text-lg font-semibold mb-2">Items</h3>

      {order.cartItems.map((item, i) => (
        <div key={i} className="flex justify-between mb-4 border-b pb-2">
          <div className="flex gap-3">
            <img src={item.image} className="w-16 h-16 rounded-md" />
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-[#6b6654]">
                {item.size} • Qty: {item.quantity}
              </p>
            </div>
          </div>
          <p className="font-semibold">₹{item.price * item.quantity}</p>
        </div>
      ))}

      <h3 className="text-lg font-semibold mt-4 mb-2">Order Summary</h3>
      <p>Subtotal: ₹{order.totalAmount - order.shippingCharge}</p>
      <p>Shipping: ₹{order.shippingCharge}</p>
      <p className="font-bold text-lg mt-2">Total: ₹{order.totalAmount}</p>

      <button
        onClick={handleReorder}
        className="mt-6 bg-[#1b180d] text-white px-6 py-2 rounded-md"
      >
        Re-Order
      </button>
    </div>
  );
}
