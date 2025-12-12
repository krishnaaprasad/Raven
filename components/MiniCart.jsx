"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Outfit, Cormorant_Garamond } from "next/font/google";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useCart } from "@/app/context/cartcontext";
import { useRouter } from "next/navigation";

const formatAmount = (amount) => {
  if (!amount || isNaN(amount)) return "0.00";
  return parseFloat(amount).toFixed(2);
};

const outfit = Outfit({ subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export default function MiniCart() {
  const {
    cartItems,
    cartCount,
    subtotal,
    removeFromCart,
    updateQuantity,
    isCartOpen,
    closeCart,
  } = useCart();

  const router = useRouter();

  // ESC KEY CLOSE
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && closeCart();

    if (isCartOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isCartOpen, closeCart]);

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  const handleViewCart = () => {
    closeCart();
    router.push("/Cart");
  };

  const handleProductClick = (slug) => {
    closeCart();
    router.push(`/product/${slug}`);
  };

  if (!isCartOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeCart}
        style={{ animation: "fadeIn 0.3s ease-out" }}
      />

      {/* DRAWER */}
      <div
        className="absolute top-0 right-0 h-full w-full max-w-[420px] bg-[#fcfbf8] shadow-2xl flex flex-col border-l border-[#e7e1cf]"
        style={{
          animation: "slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* HEADER */}
        <div className="relative px-6 py-5 border-b border-[#e7e1cf] bg-linear-to-r from-[#faf5eb] via-[#fffdf8] to-[#faf5eb]">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="w-6 h-6 text-[#b28c34]" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#b28c34] text-white text-xs font-semibold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <div>
                <h3 className={`${cormorant.className} text-xl font-semibold text-[#1b180d]`}>
                  Your Cart
                </h3>
                <p className="text-xs text-[#7c6e5a]">
                  {cartCount === 0
                    ? "No items yet"
                    : `${cartCount} item${cartCount > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="w-10 h-10 rounded-full bg-white border border-[#e7e1cf] hover:bg-[#b28c34] hover:text-white flex items-center justify-center transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CART ITEMS */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cartCount === 0 ? (
            <div
              className="flex flex-col items-center justify-center h-full text-center py-12"
              style={{ animation: "fadeInUp 0.5s ease-out" }}
            >
              <div className="w-24 h-24 rounded-full bg-[#f1e9d6] flex items-center justify-center mb-6">
                <ShoppingBag className="w-10 h-10 text-[#9e8c6b]" />
              </div>

              <h4 className={`${cormorant.className} text-xl text-[#1b180d] font-semibold mb-2`}>
                Your cart is empty
              </h4>

              <p className="text-[#7c6e5a] text-sm mb-6 max-w-[200px]">
                Discover our exquisite collection of premium fragrances
              </p>

              <button
                onClick={() => {
                  closeCart();
                  router.push("/shop");
                }}
                className="bg-[#b28c34] hover:bg-[#a27c2e] text-white px-5 py-2 rounded-full flex items-center gap-2 shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                Explore Collection
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div
                  key={`${item.id}-${item.size}-${index}`}
                  className="group relative rounded-xl p-4 border border-[#e7e1cf] bg-white hover:border-[#b28c34] hover:shadow-lg transition-all duration-300"
                  style={{
                    animation: `fadeInUp 0.4s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {/* DELETE BUTTON */}
                  <button
                    onClick={() => removeFromCart(item.id, item.size)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#f8d7d7] hover:bg-[#f3bcbc] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>

                  <div className="flex gap-4">
                    {/* IMAGE */}
                    <div
                      onClick={() => handleProductClick(item.slug)}
                      className="w-20 h-20 rounded-lg bg-[#f7f2e8] overflow-hidden cursor-pointer"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    {/* INFO */}
                    <div className="flex-1 min-w-0">
                      <h4
                        onClick={() => handleProductClick(item.slug)}
                        className={`${cormorant.className} text-lg font-semibold text-[#1b180d] cursor-pointer hover:text-[#b28c34] transition-colors pr-8 truncate`}
                      >
                        {item.name}
                      </h4>

                      <p className="text-xs text-[#7c6e5a] mt-0.5">
                        Size:
                        <span className="text-[#1b180d] font-medium ml-1">
                          {item.size}
                        </span>
                      </p>

                      {/* PRICE + QUANTITY */}
                      <div className="flex items-center justify-between mt-3">
                        <span className={`${cormorant.className} text-lg font-bold text-[#b28c34]`}>
                          ₹{formatAmount(item.price * item.quantity)}
                        </span>

                        <div className="flex items-center gap-1 bg-[#f1e9d7] rounded-full p-1">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.size,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            className="w-7 h-7 bg-white hover:bg-[#b28c34] hover:text-white rounded-full flex items-center justify-center transition-all shadow-sm"
                          >
                            <Minus className="w-3.5 h-3.5 cursor-pointer" />
                          </button>

                          <span className="w-8 text-center font-semibold text-sm">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.size,
                                item.quantity + 1
                              )
                            }
                            className="w-7 h-7 bg-white hover:bg-[#b28c34] hover:text-white rounded-full flex items-center justify-center transition-all shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5 cursor-pointer" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        {cartCount > 0 && (
          <div
            className="border-t border-[#e7e1cf] p-3 bg-linear-to-t from-[#faf5eb] to-[#fcfbf8]"
            style={{ animation: "fadeInUp 0.5s ease-out 0.2s both" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#7c6e5a]">Subtotal</span>
              <span className={`${cormorant.className} text-2xl font-bold text-[#1b180d]`}>
                ₹{formatAmount(subtotal)}
              </span>
            </div>

            <p className="text-xs text-[#7c6e5a] mb-4">
              Shipping & taxes calculated at checkout
            </p>

            {/* CHECKOUT */}
            <button
              onClick={handleCheckout}
              className={`${outfit.className} w-full h-12 bg-[#1b180d] hover:bg-[#b28c34] text-white font-semibold text-base rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2`}
              >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* VIEW CART */}
            <button
              onClick={handleViewCart}
              className="w-full text-center text-sm text-[#7c6e5a] hover:text-[#b28c34] underline underline-offset-4 mt-3 cursor-pointer"
            >
              View Full Cart
            </button>

            {/* TRUST BADGES */}
            <div className="flex items-center justify-center gap-4 mt-2 pt-2 border-t border-[#ece4d4]">
              <div className="flex items-center gap-1.5 text-xs text-[#7c6e5a]">
                🔒 Secure Checkout
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#7c6e5a]">
                🚚 Free Shipping
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>,
    document.body
  );
}
