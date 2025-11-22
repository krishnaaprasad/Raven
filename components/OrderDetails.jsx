"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/app/context/cartcontext";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Printer, HelpCircle, RotateCcw, Truck, CreditCard, Banknote, Wallet } from "lucide-react";

export default function OrderDetails({ orderId }) {
  const { addToCart } = useCart();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const formatAmount = (amount) => {
  if (!amount || isNaN(amount)) return "0.00";
  return parseFloat(amount).toFixed(2);
};

useEffect(() => {
  const loadOrder = async () => {
    // 1️⃣ Fetch order
    const res = await fetch(`/api/order/${orderId}`);
    const data = await res.json();
    if (!data.success) return;

    let merged = data.order;

    // 2️⃣ Check if order has Cashfree transaction ID
    const cfId = data.order?.cf_order_id;

    if (cfId) {
      try {
        // 3️⃣ Only verify if cf_order_id exists
        const verifyRes = await fetch(`/api/payment/verify?orderId=${orderId}&cfOrderId=${cfId}`);
        const verifyJson = await verifyRes.json();

        // 4️⃣ Merge payment details if successful
        if (verifyJson.success) {
          merged = {
            ...merged,
            paymentMethod: verifyJson.paymentMethod || merged.paymentMethod,
            paymentDetails: verifyJson.paymentDetails || {},
          };
        }
      } catch (err) {
        console.log("Verification skipped: ", err);
      }
    } else {
      console.log("⚠️ No cf_order_id → skipping verification");
    }

    setOrder(merged);
  };

  loadOrder();
}, [orderId]);


  if (!order) {
    return (
      <p className="text-center py-6 text-[#9a864c]">
        Loading Order Details...
      </p>
    );
  }

  const handleReorder = () => {
    order.cartItems.forEach((item) => {
      addToCart(
        {
          id: item._id,            // cart expects id
          name: item.name,
          slug: item.slug,
          price: Number(item.price),   // convert to number
          image: item.image,
          size: item.size || "Default",
        },
        Number(item.quantity) || 1      // MUST pass quantity separately
      );
    });

      toast.success("Items added to your cart!");

      setTimeout(() => {
        router.push("/Cart");
      }, 500);
  };

  
  const subtotal = order.cartItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const shipping = order.shippingCharge || 0;
  const total = subtotal + shipping;

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8">

      {/* LEFT SIDE */}
      <div className="w-full lg:w-2/3 flex flex-col gap-4">

        {/* Breadcrumb + Title */}
        <div>
          <h3 className="text-[25px] font-bold text-[#1b180d]">
            Order #{order.customOrderId || order._id}
          </h3>
        </div>

        {/* Order Meta */}
        <div className="bg-[#fcfbf8] border border-[#e7e1cf] rounded-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

          <div className="grid grid-cols-[auto_1fr] sm:grid-cols-[110px_1fr] gap-x-6 gap-y-3">
            <p className="text-[#9a864c] text-sm">Order Date</p>
            <p className="text-[#1b180d] text-sm font-semibold">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>

           <p className="text-[#9a864c] text-sm">Order Status</p>
            <div className="flex flex-col">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold w-fit ${
                  order.order_status === "FAILED" || order.order_status === "CANCELLED"
                    ? "bg-red-100 text-red-700"
                    : "bg-[#eebd2b]/20 text-[#1b180d]"
                }`}
              >
                {order.order_status || "Processing"}
              </span>

              {(order.order_status === "FAILED" || order.order_status === "CANCELLED") && (
                <p className="text-[#b54747] text-xs font-medium mt-1">
                  Order cancelled due to payment failure. Any deducted amount will be refunded in 5–7 business days.
                </p>
              )}
            </div>
          </div>

          {/* TRACK ORDER — hide for FAILED/CANCELLED */}
          {order.order_status !== "FAILED" && order.order_status !== "CANCELLED" && (
            <div className="w-full md:w-auto mt-4 md:mt-0">
              <button className="w-full sm:w-auto flex cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-[#eebd2b] text-[#1b180d] gap-2 text-xs font-bold hover:opacity-90">
                <Truck className="w-5 h-5" />
                Track Order
              </button>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="bg-[#fcfbf8] border border-[#e7e1cf] rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-[#1b180d]">Items Ordered</h3>

          <div className="flex flex-col divide-y divide-[#e7e1cf]">
            {order.cartItems.map((item, index) => (
              <div key={index} className="flex items-center py-6 gap-4">
                <img
                  src={item.image}
                  className="w-24 h-24 object-cover rounded-lg border border-[#e7e1cf]"
                  alt={item.name}
                />

                <div className="flex-grow">
                  <p className="text-[#1b180d] font-bold">{item.name}</p>
                  <p className="text-[#9a864c] text-sm">{item.size}</p>
                  <p className="text-[#9a864c] text-sm">Qty: {item.quantity}</p>
                </div>

                <p className="text-[#1b180d] font-semibold text-right">
                  ₹{formatAmount(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-2 items-center justify-between">

          <div className="flex flex-wrap gap-4">
            {/* PRINT BUTTON – only show if NOT cancelled */}
              {order.order_status !== "FAILED" && order.order_status !== "CANCELLED" && (
                <button
                  onClick={() => window.open(`/api/invoice?orderId=${order._id}`, "_blank")}
                  className="flex cursor-pointer items-center justify-center rounded-lg h-10 px-4 border border-[#e7e1cf] text-[#1b180d] gap-2 text-xs font-bold"
                >
                  <Printer className="w-4 h-4" />
                  Print Invoice
                </button>
              )}

            {/* NEED HELP */}
            <button
              onClick={() => {
                const orderNo = order.customOrderId || order._id;
                const subject = `Support Request for Order ${orderNo}`;
                const body = `Hello Raven Support,%0D%0A%0D%0AI need help with my order.%0D%0AOrder ID: ${orderNo}%0D%0AThank you.`;
                window.location.href = `mailto:contact@ravenfragrance.in?subject=${subject}&body=${body}`;
              }}
              className="flex cursor-pointer items-center justify-center rounded-lg h-10 px-4 border border-[#e7e1cf] text-[#1b180d] gap-2 text-xs font-bold hover:bg-[#fcf8ef]"
            >
              <HelpCircle className="w-4 h-4" />
              Need Help?
            </button>
          </div>

          {/* 🔴 FAILED — RETRY PAYMENT */}
          {(order.order_status === "FAILED" || order.order_status === "CANCELLED") && (
            <button
              onClick={() => router.push("/Cart")}
              className="w-full sm:w-auto flex cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-red-500 text-white gap-2 text-sm font-bold hover:bg-red-600 transition"
            >
              Retry Order
            </button>
          )}

          {/* 🟡 SUCCESS — REORDER */}
          {(order.order_status !== "FAILED" &&
            order.order_status !== "CANCELLED") && (
            <button
              onClick={handleReorder}
              className="w-full sm:w-auto flex cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-[#eebd2b] text-[#1b180d] gap-2 text-sm font-bold hover:opacity-90"
            >
              <RotateCcw className="w-5 h-5" />
              Reorder
            </button>
          )}

        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">

        {/* Shipping Address */}
        <div className="bg-[#fcfbf8] border border-[#e7e1cf] rounded-lg p-6">
          <h3 className="text-lg font-bold mb-3 text-[#1b180d]">Shipping Address</h3>

          <div className="text-sm text-[#9a864c] leading-relaxed">
            <p className="text-[#1b180d] font-semibold">{order.userName}</p>

            <p>{order.addressDetails.address1}</p>
            <p>{order.addressDetails.address2}</p>
            <p>
              {order.addressDetails.city}, {order.addressDetails.state},{" "}
              {order.addressDetails.pincode}
            </p>
            <p>India</p>
            <p>{order.phone}</p>
          </div>
        </div>

        {/* Shipping + Payment Method */}
        <div className="bg-[#fcfbf8] border border-[#e7e1cf] rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold mb-1 text-[#1b180d]">Shipping Method</h4>
              <p className="text-sm text-[#9a864c]">Standard Delivery (3–5 days)</p>
            </div>

            <div>
              <h4 className="text-sm font-bold mb-1 text-[#1b180d]">Payment Method</h4>

              <div className="flex items-start gap-2">
                {(() => {
                  const methodRaw = order?.paymentMethod || "";
                  const details = order?.paymentDetails || {};
                  const method = methodRaw.toUpperCase();

                  let icon = <CreditCard className="w-5 h-5 text-[#b28c34]" />;
                  let label = "Online Payment (via Cashfree)";

                  // UPI
                  if (method.includes("UPI") || details?.upi_id) {
                    icon = <Banknote className="w-5 h-5 text-[#b28c34]" />;
                    const upiId =
                      details?.upiId ||
                      details?.upi_id ||
                      methodRaw.match(/[a-zA-Z0-9._-]+@[a-zA-Z]+/)?.[0];
                    label = upiId ? `UPI (${upiId})` : "UPI Payment";
                  }

                  // NetBanking
                  else if (method.includes("NETBANKING") || details?.type === "NETBANKING") {
                    icon = <Wallet className="w-5 h-5 text-[#b28c34]" />;
                    label = details?.bankCode
                      ? `NetBanking (${details.bankCode})`
                      : "NetBanking Payment";
                  }

                  // Card
                  else if (details?.type === "CARD" || method.includes("CARD")) {
                    const last4 = details?.last4 || "XXXX";
                    const network = details?.network || "Card";
                    icon = <CreditCard className="w-5 h-5 text-[#b28c34]" />;
                    label = `${network} (ending in ${last4})`;
                  }

                  // Wallet
                  else if (details?.type === "WALLET") {
                    icon = <Wallet className="w-5 h-5 text-[#b28c34]" />;
                    label = details?.provider
                      ? `Wallet (${details.provider})`
                      : "Wallet Payment";
                  }

                  return (
                    <>
                      {icon}
                      <p className="text-sm text-[#9a864c] font-medium">{label}</p>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-[#fcfbf8] border border-[#e7e1cf] rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 text-[#1b180d]">Order Summary</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <p className="text-[#9a864c]">Subtotal</p>
              <p className="text-[#1b180d]">₹{formatAmount(subtotal)}</p>
            </div>

            <div className="flex justify-between">
              <p className="text-[#9a864c]">Shipping</p>
              <p className="text-[#1b180d]">₹{formatAmount(shipping)}</p>
            </div>

            <div className="border-t border-[#e7e1cf] my-3"></div>

            <div className="flex justify-between text-base font-bold">
              <p className="text-[#1b180d]">Grand Total</p>
              <p className="text-[#1b180d] font-bold">₹{formatAmount(total)}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
