"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Crimson_Text } from "next/font/google";
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

const crimson = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const formatAmount = (amount) => {
  if (!amount || isNaN(amount)) return "0.00";
  return parseFloat(amount).toFixed(2);
};

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
    <div className="fixed inset-0 z-[9999] font-sans">
      
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeCart}
        style={{ animation: "fadeIn 0.3s ease-out" }}
      />

      {/* DRAWER */}
      <div
        className="absolute top-0 right-0 h-full w-full max-w-[420px] 
        bg-(--theme-bg) border-l border-(--theme-border) 
        shadow-2xl flex flex-col"
        style={{ animation: "slideInRight 0.4s cubic-bezier(0.16,1,0.3,1)" }}
      >
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-(--theme-border)">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 text-(--theme-text)" />
              <div>
                <h3 className={`${crimson.className} text-xl font-semibold text-(--theme-text)`}>
                  Your Cart
                </h3>
                <p className="text-xs text-(--theme-muted)">
                  {cartCount === 0
                    ? "No items yet"
                    : `${cartCount} item${cartCount > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="w-10 h-10 rounded-full 
              border border-(--theme-border) 
              hover:bg-(--theme-soft) 
              flex items-center justify-center transition"
            >
              <X className="w-5 h-5 text-(--theme-text)" />
            </button>
          </div>
        </div>

        {/* CART ITEMS */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cartCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-24 h-24 rounded-full bg-(--theme-soft) flex items-center justify-center mb-6">
                <ShoppingBag className="w-10 h-10 text-(--theme-muted)" />
              </div>

              <h4 className={`${crimson.className} text-xl font-semibold text-(--theme-text) mb-2`}>
                Your cart is empty
              </h4>

              <p className="text-(--theme-muted) text-sm mb-6 max-w-[200px]">
                Discover our collection
              </p>

              <button
                onClick={() => {
                  closeCart();
                  router.push("/collection");
                }}
                className="bg-(--theme-text) text-(--theme-bg) 
                px-3 py-2 rounded-full font-semibold
                flex items-center gap-2 
                transition cursor-pointer "
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
                  className="group relative rounded-xl p-4 
                  border border-(--theme-border) 
                  bg-(--theme-soft) 
                  transition"
                  style={{
                    animation: `fadeInUp 0.4s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <button
                    onClick={() => removeFromCart(item.id, item.size)}
                    className="absolute top-3 right-3 w-8 h-8 
                    rounded-full bg-(--theme-bg) 
                    border border-(--theme-border)
                    flex items-center justify-center opacity-100 
                     transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-(--theme-text)" />
                  </button>

                  <div className="flex gap-4">
                    <div
                      onClick={() => handleProductClick(item.slug)}
                      className="w-20 h-20 rounded-lg 
                      bg-(--theme-bg) 
                      border border-(--theme-border)
                      overflow-hidden cursor-pointer"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-(--theme-muted)">
                          No image
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4
                        onClick={() => handleProductClick(item.slug)}
                        className={`${crimson.className} text-lg font-semibold text-(--theme-text) cursor-pointer truncate`}
                      >
                        {item.name}
                      </h4>

                      <p className="text-xs text-(--theme-muted) mt-1">
                        Size:
                        <span className="text-(--theme-text) ml-1">
                          {item.size}
                        </span>
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        <span className={`${crimson.className} text-lg font-bold text-(--theme-text)`}>
                          ₹{formatAmount(item.price * item.quantity)}
                        </span>

                        <div className="flex items-center gap-1 
                        bg-(--theme-bg) 
                        rounded-full p-1 
                        border border-(--theme-border) ">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.size,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            className="w-7 h-7 flex items-center justify-center cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5 text-(--theme-text)" />
                          </button>

                          <span className="w-8 text-center text-sm text-(--theme-text)">
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
                            className="w-7 h-7 flex items-center justify-center cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-(--theme-text)" />
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
          <div className="border-t border-(--theme-border) p-4 bg-(--theme-soft)">
            <div className="flex items-center justify-between mb-2">
              <span className="text-(--theme-muted)">Subtotal</span>
              <span className={`${crimson.className} text-2xl font-bold text-(--theme-text)`}>
                ₹{formatAmount(subtotal)}
              </span>
            </div>

            <p className="text-xs text-(--theme-muted) mb-4">
              Shipping & taxes calculated at checkout
            </p>

            <button
              onClick={handleCheckout}
              className="w-full h-12 
              bg-(--theme-text) 
              text-(--theme-bg) 
              font-semibold 
              rounded-xl 
              flex items-center justify-center gap-2 cursor-pointer"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleViewCart}
              className="w-full text-center text-sm text-(--theme-muted) underline mt-3 cursor-pointer"
            >
              View Full Cart
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>,
    document.body
  );
}
