'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '../context/cartcontext';
import { useSession } from 'next-auth/react';
import { CreditCard, Banknote, Wallet, AlertCircle, HelpCircle } from "lucide-react";
import { event } from "@/lib/ga"; // ← ADD THIS
import { Crimson_Text } from "next/font/google";

const crimson = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const formatAmount = (amount) => {
  if (!amount || isNaN(amount)) return "0.00";
  return parseFloat(amount).toFixed(2);
};

export default function OrderSuccess() {
  const { data: session } = useSession();
  const { clearCart, cart, saveCart } = useCart();

  const [status, setStatus] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [referenceId, setReferenceId] = useState('');
  const [failureReason, setFailureReason] = useState('');
  const hasFetched = useRef(false);

  useEffect(() => {
  const run = async () => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");
    const cfOrderId = params.get("cfOrderId");

    if (!orderId || !cfOrderId) {
      setStatus("failed");
      return;
    }

    try {
      const verifyRes = await fetch(`/api/payment/verify?orderId=${orderId}&cfOrderId=${cfOrderId}`);
      const verifyData = await verifyRes.json();

      // ✅ Use the updated order after verify, not stale one
      const orderRes = await fetch(`/api/order/${orderId}?t=${Date.now()}`);
      const orderJson = await orderRes.json();

      const mergedOrder = {
        ...orderJson.order,
        paymentMethod: verifyData.paymentMethod,
        paymentDetails: verifyData.paymentDetails,
      };

      setOrderData(mergedOrder);
      setReferenceId(verifyData.referenceId || "N/A");

        if (verifyData?.success === true && orderJson?.success === true) {
            // 🔥 GA4: Track successful purchase
          event({
            action: "purchase",
            params: {
              transaction_id: mergedOrder.customOrderId || mergedOrder._id,
              currency: "INR",
              value:
                (mergedOrder.cartItems || []).reduce(
                  (sum, i) => sum + i.price * i.quantity,
                  0
                ) + (mergedOrder.shippingCharge || 0),

              shipping: mergedOrder.shippingCharge || 0,

              items: (mergedOrder.cartItems || []).map((item) => ({
                item_id: item.productId || item.id || item._id || item.slug,
                item_name: item.name,
                price: item.price,
                quantity: item.quantity,
                item_variant: item.size,
              })),
            },
          });
          clearCart();
            localStorage.removeItem("failedOrder");
            localStorage.removeItem("checkoutUser");
            localStorage.removeItem("orderPreview");
            localStorage.removeItem("shipping");
            localStorage.removeItem("shippingCharge"); 
            // ✅ cleanup any previous failed order data
          setStatus("success");
        } else {
        setStatus("failed");
        setFailureReason(verifyData.message || "Payment verification failed");

        // ✅ Save cart & user data for retry
        const failedCart = orderJson.order?.cartItems || [];
        const failedUser = {
          firstName: orderJson.order?.userName?.split(" ")[0] || "",
          lastName: orderJson.order?.userName?.split(" ")[1] || "",
          email: orderJson.order?.email,
          phone: orderJson.order?.phone,
          address1: orderJson.order?.addressDetails?.address1 || "",
          address2: orderJson.order?.addressDetails?.address2 || "",
          city: orderJson.order?.addressDetails?.city || "",
          state: orderJson.order?.addressDetails?.state || "",
          pincode: orderJson.order?.addressDetails?.pincode || "",
        };

        if (failedCart.length > 0) {
          localStorage.setItem(
            "failedOrder",
            JSON.stringify({ cartItems: failedCart, userData: failedUser })
          );
          window.dispatchEvent(new Event("storage")); // ✅ notify CartContext immediately
        }

      }
    } catch (e) {
      console.error("Order success load error:", e);
      setStatus("failed");
    }
  };

  run();
}, [clearCart]);

  if (!status)
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--theme-bg) text-(--theme-muted) text-lg font-medium animate-pulse">
        Verifying your payment...
      </div>
    );

  const isSuccess = status === 'success';
  const items = orderData?.cartItems || [];
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = orderData?.shippingCharge || 0;
  const total = subtotal + shipping;

  return (
    <section className="bg-(--theme-bg) min-h-screen font-sans text-(--theme-text) transition-colors duration-300">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">

        {/* 🔴 Payment Failed Banner */}
        {!isSuccess && (
          <div className="max-w-3xl mx-auto mb-6 bg-(--theme-soft) border-(--theme-border) text-(--theme-text) rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[16px]">Payment Failed</p>
              <p className="text-sm text-(--theme-muted) leading-snug">
                {failureReason || "We couldn’t process your payment. Please try again."}
              </p>
            </div>
          </div>
        )}

        {/* Title */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className={`${crimson.className} text-[32px] md:text-5xl font-bold leading-tight tracking-tight text-(--theme-text)`}>
            {isSuccess ? 'Thank you for your order!' : 'Payment Failed'}
          </h1>
          <p className="text-(--theme-muted) text-base md:text-lg mt-3">
            {isSuccess
              ? 'Your confirmation and order details have been sent to your email.'
              : 'Your order attempt has been recorded. Please retry payment or contact support.'}
          </p>
        </div>

        {/* ✅ Show order details for both success & failed */}
        {orderData && (
          <div className="max-w-4xl mx-auto mt-10 bg-(--theme-bg) rounded-xl border border-(--theme-border) shadow-sm">
            <div className="p-6 md:p-8">
              <h2 className="text-[22px] font-bold leading-tight tracking-tight">
                Order #{orderData.customOrderId || orderData._id}
              </h2>
            </div>

            {/* Items */}
            <div className="border-t border-(--theme-border) p-6 md:p-8">
              <div className="space-y-4">
                {items.map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-18 h-18 rounded-lg border border-(--theme-border) bg-center bg-cover shrink-0"
                        style={{
                          backgroundImage: item.image
                            ? `url(${item.image})`
                            : `url("/placeholder.png")`,
                        }}
                      />
                      <div className="flex flex-col justify-center pt-1">
                        <p className={`${crimson.className} text-base font-medium text-(--theme-text)`}>{item.name}</p>
                        <p className="text-sm text-(--theme-muted)">
                          {item.size} ml | Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className={`${crimson.className} text-base font-medium text-(--theme-text)`}>
                      ₹{formatAmount(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-8 border-t border-(--theme-border) pt-6 flex justify-end">
                <div className="w-full max-w-xs space-y-3 text-sm">
                  <div className="flex justify-between text-(--theme-muted)">
                    <span>Subtotal</span>
                    <span className="text-(--theme-text)">₹{formatAmount(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-(--theme-muted)">
                    <span>Shipping ({orderData.deliveryType})</span>
                    <span className="text-(--theme-text)">
                      {shipping ? `₹${formatAmount(shipping)}` : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between text-(--theme-text) text-base font-bold border-t border-(--theme-border) pt-3 mt-2">
                    <span>Total</span>
                    <span>₹{formatAmount(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping & Payment Info */}
            <div className="border-t border-[#e7e5e1] p-6 md:p-8 grid md:grid-cols-2 gap-8">
              <div>
                <h3 className={`${crimson.className} text-base font-bold text-(--theme-text)`}>Shipping Address</h3>
                <p className="mt-3 text-(--theme-muted) text-[15px] leading-relaxed">
                  <span className="block font-medium text-(--theme-text)">{orderData.userName}</span>
                  <span className="block">
                    {[orderData.addressDetails?.address1, orderData.addressDetails?.address2]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                  <span className="block">
                    {[orderData.addressDetails?.city, orderData.addressDetails?.state, orderData.addressDetails?.pincode]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                  <span className="block">India</span>
                </p>
              </div>

              {/* ✅ Bulletproof Payment Method Display */}
<div>
  <h3 className="text-base font-bold text-(--theme-text)">Payment Method</h3>
  <div className="mt-3 flex items-start gap-3">
    {(() => {
      const methodRaw = orderData?.paymentMethod || "";
      const method = methodRaw.toUpperCase();
      const details = orderData?.paymentDetails || {};
      let icon = <CreditCard size={18} className="text-(--theme-text) mt-0.5" />;
      let label = "Cashfree Payment";

      // 🟡 UPI
      if (method.includes("UPI") || details?.upi_id) {
        icon = <Banknote size={18} className="text-(--theme-text) mt-0.5" />;
        const upiId =
          details?.upiId ||
          details?.upi_id ||
          methodRaw.match(/[a-zA-Z0-9._-]+@[a-zA-Z]+/)?.[0];
        label = upiId ? `UPI Payment (${upiId})` : "UPI Payment";
      }

      // 🟢 NetBanking
      else if (method.includes("NETBANKING") || details?.type === "NETBANKING") {
        icon = <Wallet size={18} className="text-(--theme-text) mt-0.5" />;
        label = details?.bankCode
          ? `NetBanking (${details.bankCode})`
          : "NetBanking Payment";
      }

      // 🔵 Card
      else if (details?.type === "CARD" || method.includes("CARD")) {
        const last4 = details?.last4 || "XXXX";
        const network = details?.network || "Card";
        const bank = details?.bank ? ` – ${details.bank}` : "";
        icon = <CreditCard size={18} className="text-(--theme-text) mt-0.5" />;
        label = `${network} (ending in ${last4})`;
      }

      // 🪙 Wallet
      else if (details?.type === "WALLET") {
        icon = <Wallet size={18} className="text-(--theme-text) mt-0.5" />;
        label = details?.provider
          ? `Wallet (${details.provider})`
          : "Wallet Payment";
      }

      // ⚪️ Default Fallback
      else {
        icon = <CreditCard size={18} className="text-(--theme-text) mt-0.5" />;
        label = "Online Payment (via Cashfree)";
      }

      return (
        <>
          {icon}
          <div>
            <p className="text-(--theme-text) font-medium text-[15px] leading-snug">
              {label}
            </p>
          </div>
        </>
      );
    })()}
  </div>
</div>
            </div>
            {/* ✅ Buttons */}
            <div className="max-w-4xl mx-auto mt-10 text-center print:hidden">
              {isSuccess ? (
                <>
                  <div className="flex flex-col items-center gap-3 sm:gap-4 md:flex-row md:justify-center md:items-center md:gap-5 mb-5">
                    <Link
                      href="/"
                      className="bg-(--theme-text) text-(--theme-bg) font-semibold py-2 px-6 rounded-md hover:opacity-90 transition-all duration-200 text-sm sm:text-[15px] shadow-sm w-[75%] sm:w-auto"
                    >
                      Continue Shopping
                    </Link>
                    <div className="flex justify-center gap-3 w-[75%] sm:w-auto">
                      <Link
                        href={`/api/invoice?orderId=${orderData._id}`}
                        target="_blank"
                        className="flex-1 sm:flex-none border border-(--theme-border) text-(--theme-text) font-medium py-2 px-6 rounded-md hover:bg-(--theme-soft) hover:bg-(--theme-soft) transition-all duration-200 text-sm sm:text-[13px] cursor-pointer text-center"
                      >
                        View Receipt (PDF)
                      </Link>
                      {session && (
                        <Link
                          href="/my-account?tab=Orders"
                          className="flex-1 sm:flex-none border border-(--theme-border) text-(--theme-text) font-medium py-2 px-6 rounded-md hover:bg-(--theme-soft) hover:bg-(--theme-soft) transition-all duration-200 text-sm sm:text-[13px] cursor-pointer"
                        >
                          View Order History
                        </Link>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                  <Link
                    href="/checkout"
                    className="bg-(--theme-text) text-(--theme-bg) font-medium py-2 px-6 rounded-md hover:bg-red-600 transition-all duration-200 text-sm sm:text-base"
                  >
                    Retry Payment
                  </Link>
                  <Link
                    href="/Cart"
                    className="border border-(--theme-border) text-(--theme-text) font-medium py-2 px-6 rounded-md hover:bg-(--theme-soft) transition-all duration-200 text-sm sm:text-base"
                  >
                    Return to Cart
                  </Link>
                  <Link
                    href="/"
                    className="bg-(--theme-text) text-(--theme-text) font-medium py-2 px-6 rounded-md hover:opacity-90 transition-all duration-200 text-sm sm:text-base"
                  >
                    Continue Shopping
                  </Link>
                </div>
              )}
            </div>

            {/* 💬 Support Section */}
            {!isSuccess && (
              <div className="max-w-4xl mx-auto mt-8 text-center border-t border-(--theme-border) pt-4">
                <div className="flex flex-col items-center gap-2 mb-3">
                  <HelpCircle size={22} className="text-(--theme-text)" />
                  <p className="text-sm text-(--theme-muted) leading-relaxed max-w-md">
                    Need help with your payment? <br />
                    Reach out to our <span className="text-(--theme-text) font-medium">Support Team</span> at <br />
                    <a href="mailto:support@ravenfragrance.in" className="text-(--theme-text) hover:underline">
                      contact@ravenfragrance.in
                    </a>{' '}
                    or{' '}
                    <a
                      href="https://wa.me/918424832375"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-(--theme-text) hover:underline"
                    >
                      WhatsApp Us
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </section>
  );
}
