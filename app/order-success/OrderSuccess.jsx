"use client";
import { useEffect, useState } from "react";
import { useCart } from "../context/cartcontext";

export default function OrderSuccess() {
  const { clearCart } = useCart();

  // ✅ Freeze query params on mount — avoids infinite rerenders
  const [params] = useState(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      return {
        orderId: sp.get("orderId"),
        cfOrderId: sp.get("cfOrderId"),
      };
    }
    return { orderId: null, cfOrderId: null };
  });

  const { orderId, cfOrderId } = params;
  const [status, setStatus] = useState("");
  const [amount, setAmount] = useState(0);
  const [referenceId, setReferenceId] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!orderId || !cfOrderId) {
      setStatus("Payment Failed");
      return;
    }

    async function fetchOrder() {
      try {
        const res = await fetch(
          `/api/payment/verify?orderId=${orderId}&cfOrderId=${cfOrderId}`
        );
        const data = await res.json();

        if (data.success && data.paid) {
          setStatus("Payment Successful");
          setAmount(data.amount);
          setReferenceId(data.referenceId || "N/A");
          clearCart();
          localStorage.removeItem("failedOrder");
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        } else {
          setStatus("Payment Failed");
          const failedOrder = {
            cartItems: JSON.parse(localStorage.getItem("cart")) || [],
            shipping:
              JSON.parse(localStorage.getItem("checkoutShipping")) ||
              "standard",
            user: JSON.parse(localStorage.getItem("checkoutUser")) || {},
          };
          localStorage.setItem("failedOrder", JSON.stringify(failedOrder));
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("Payment Failed");
      }
    }

    fetchOrder();
  }, [orderId]); // ✅ depends only on orderId (frozen)

  if (!status)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCF8F3] text-[#6B4B1E] text-xl font-medium animate-pulse">
        Processing your payment...
      </div>
    );

  const isSuccess = status === "Payment Successful";
  const shoppingURL = "/product";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FCF8F3] p-6 text-center relative overflow-hidden transition-all duration-500">
      {showConfetti && <ConfettiEffect />}
      {isSuccess ? (
        <SuccessCard
          orderId={orderId}
          referenceId={referenceId}
          amount={amount}
          shoppingURL={shoppingURL}
        />
      ) : (
        <FailedCard retryURL="/checkout" />
      )}
    </div>
  );
}

function SuccessCard({ orderId, referenceId, amount, shoppingURL }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[#e6decf] p-10 max-w-md w-full animate-fadeIn relative z-10">
      <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-[#D4AF37]/20 border-4 border-[#D4AF37] animate-bounce-slow">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="#D4AF37"
          className="w-10 h-10"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold mb-3 text-[#6B4B1E] tracking-wide">
        Thank You for Your Purchase!
      </h1>
      <p className="text-[#8B6C3A] mb-6">
        Your order has been placed successfully. We’ll send you a confirmation
        email soon.
      </p>
      <div className="text-left bg-[#FCF8F3] rounded-xl p-4 border border-[#e6decf] mb-4">
        <p className="text-[#6B4B1E] mb-1">
          <strong>Order ID:</strong> {orderId}
        </p>
        <p className="text-[#6B4B1E] mb-1">
          <strong>Transaction ID:</strong> {referenceId}
        </p>
        <p className="text-[#6B4B1E]">
          <strong>Total Paid:</strong> ₹{amount}
        </p>
      </div>
      <button
        onClick={() => (window.location.href = shoppingURL)}
        className="mt-4 w-full py-3 bg-black text-white rounded-full font-semibold hover:bg-[#2c2c2c] transition-all"
      >
        Continue Shopping
      </button>
    </div>
  );
}

function FailedCard({ retryURL }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[#e6decf] p-10 max-w-md w-full animate-fadeIn">
      <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-red-100 border-4 border-red-500 animate-pulse">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="red"
          className="w-10 h-10"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold mb-3 text-[#6B4B1E]">Payment Failed</h1>
      <p className="text-[#8B6C3A] mb-6">
        We couldn’t process your payment. Please try again or contact support.
      </p>
      <button
        onClick={() => (window.location.href = retryURL)}
        className="mt-4 w-full py-3 bg-black text-white rounded-full font-semibold hover:bg-[#2c2c2c] transition-all"
      >
        Try Again
      </button>
    </div>
  );
}

function ConfettiEffect() {
  const pieces = Array.from({ length: 30 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {pieces.map((_, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: Math.random() * 100 + "%",
            animationDelay: Math.random() * 2 + "s",
            animationDuration: 2 + Math.random() * 2 + "s",
            backgroundColor: Math.random() > 0.5 ? "#D4AF37" : "#E8C547",
            opacity: 0.7 + Math.random() * 0.3,
          }}
        />
      ))}
    </div>
  );
}

// Inline styles for animation
const styles = `
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes bounce-slow { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes fall { 0% { transform: translateY(-10%) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
.animate-fadeIn { animation: fadeIn 0.8s ease forwards; }
.animate-bounce-slow { animation: bounce-slow 2s infinite; }
.confetti-piece { position: absolute; top: 0; width: 6px; height: 12px; border-radius: 2px; animation: fall linear forwards; }
`;
if (typeof document !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.innerHTML = styles;
  document.head.appendChild(styleTag);
}
