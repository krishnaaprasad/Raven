// components/QuickViewModal.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  Star,
  ShoppingBag,
  Minus,
  Plus,
  ExternalLink,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {  Cormorant_Garamond } from "next/font/google";

import { useQuickView } from "@/app/context/QuickViewContext";
import { useCart } from "@/app/context/cartcontext";

const cormorant = Cormorant_Garamond({
    subsets: ["latin"],
    weight: ["400", "700"],
    display: "swap",
  });

export default function QuickViewModal() {
  const { product, isOpen, closeQuickView } = useQuickView();
  const { addToCart,openCart } = useCart();
  const router = useRouter();

  const [qty, setQty] = useState(1);
  const [variantIndex, setVariantIndex] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  // Swipe refs
  const [swipeTranslate, setSwipeTranslate] = useState(0);
  const wrapperRef = useRef(null);
  const touchStartYRef = useRef(null);
  const isDraggingRef = useRef(false);

  

  // Reset whenever product changes
  useEffect(() => {
    if (product) {
      setQty(1);
      setVariantIndex(0);
      setSwipeTranslate(0);
    }
  }, [product]);

  // Normalize images
  const images = useMemo(() => {
    if (!product) return [];
    return product.images?.map((i) => (typeof i === "string" ? i : i?.original)) || [];
  }, [product]);

  const variant = useMemo(() => {
    if (!product?.variants?.length) return { price: 0, mrp: 0, size: "" };
    return product.variants[variantIndex] || product.variants[0];
  }, [product, variantIndex]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      closeQuickView();
      setIsClosing(false);
      setSwipeTranslate(0);
    }, 180);
  };

  // =======================
  // SWIPE-TO-CLOSE HANDLING
  // =======================
useEffect(() => {
  const el = wrapperRef.current;
  if (!el) return;

  function onTouchStart(e) {
    if (e.touches?.length !== 1) return;
    touchStartYRef.current = e.touches[0].clientY;
    isDraggingRef.current = true;
  }

  function onTouchMove(e) {
    if (!isDraggingRef.current) return;
    const currentY = e.touches[0].clientY;
    const delta = Math.max(0, currentY - (touchStartYRef.current || 0));
    const limit = Math.min(delta, window.innerHeight * 0.6);

    setSwipeTranslate(limit);
    el.style.setProperty("--qv-backdrop-opacity", `${Math.max(0.25, 0.5 - limit / 1200)}`);
  }

  function onTouchEnd() {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (swipeTranslate > 100) {
      wrapperRef.current.style.transition = "transform .18s ease-out";
      wrapperRef.current.style.transform = `translateY(${window.innerHeight}px)`;
      setTimeout(() => {
        handleClose();
        wrapperRef.current.style.transform = "";
        wrapperRef.current.style.transition = "";
      }, 160);
    } else {
      wrapperRef.current.style.transition = "transform .18s ease-out";
      setSwipeTranslate(0);
      setTimeout(() => {
        wrapperRef.current.style.transition = "";
      }, 180);
    }

    el.style.setProperty("--qv-backdrop-opacity", "0.5");
  }

  el.addEventListener("touchstart", onTouchStart, { passive: true });
  el.addEventListener("touchmove", onTouchMove, { passive: true });
  el.addEventListener("touchend", onTouchEnd, { passive: true });
  el.addEventListener("touchcancel", onTouchEnd, { passive: true });

  return () => {
    el.removeEventListener("touchstart", onTouchStart);
    el.removeEventListener("touchmove", onTouchMove);
    el.removeEventListener("touchend", onTouchEnd);
    el.removeEventListener("touchcancel", onTouchEnd);
  };
}, []); // 👈 THIS MUST ALWAYS BE EXACTLY [] (never dynamic)



  // =======================
  // ACTIONS
  // =======================
const handleAddToCart = () => {
  if (!product) return;

  addToCart(
    {
      id: product._id,
      name: product.name,
      slug: product.slug,
      price: variant.price,
      mrp: variant.mrp,
      image: images[0] || "",
      size: variant.size || "",
    },
    qty
  );

  toast.success(`${product.name} added to cart`, {
    style: {
      background: "#1b180d",
      color: "#fff",
      border: "1px solid #B28C34",
    },
  });

  closeQuickView();  // close modal
  setTimeout(() => openCart(), 50);  // auto-open minicart
};

  const handleBuyNow = () => {
    if (!product) return;

    const buyNowItem = {
      id: product._id,
      name: product.name,
      slug: product.slug,
      price: variant.price,
      mrp: variant.mrp,
      image: images[0] || "",
      size: variant.size || "",
      quantity: qty,
    };

    sessionStorage.setItem("buyNowItem", JSON.stringify(buyNowItem));
    handleClose();
    router.push("/checkout?mode=buynow");
  };

  const viewDetails = () => {
    handleClose();
    router.push(`/product/${product.slug}`);
  };

  if (!isOpen || !product) return null;

  const translateStyle = { transform: `translateY(${swipeTranslate}px)` };

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 z-99999 flex items-center justify-center p-3"
      onClick={handleClose}
      style={{ ["--qv-backdrop-opacity"]: 0.5 }}
    >
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black"
        style={{
          opacity: "var(--qv-backdrop-opacity)",
          transition: "opacity .12s linear",
          backdropFilter: "blur(6px)",
        }}
      />

      {/* MODAL CARD */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          ...translateStyle,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
        className="relative w-full max-w-4xl bg-[#fcfbf8] rounded-2xl shadow-2xl overflow-hidden transform-gpu md:mx-2"
      >
        {/* GOLD TOP BORDER */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[linear-gradient(90deg,#af9b64,#B4933A,#af9b64)]" />

        {/* CLOSE BUTTON */}
<button
  onClick={handleClose}
  className={
    `
      absolute top-4 right-4 z-50
      w-8 h-8 rounded-full
      flex items-center justify-center
      bg-white/90 backdrop-blur-sm
      border border-[#e7e1cf]
      shadow-lg
    `
  }
>
  <X className="w-5 h-5 text-[#1b180d]" />
</button>



        {/* CONTENT (scrollable on mobile) */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2 flex-1 overflow-y-auto"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* LEFT IMAGE AREA */}
          <div className="relative p-4 bg-[#f7f2e8] flex items-center justify-center">

            {/* ⭐ BADGES RESTORED ⭐ */}
            <div className="absolute top-6 left-6 z-30 flex flex-col gap-2">
              {product.isNew && (
                <span className="bg-[#b28c34] text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
                  NEW ARRIVAL
                </span>
              )}
              {product.isBestseller && (
                <span className="bg-[#1b180d] text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
                  BESTSELLER
                </span>
              )}
            </div>

            <div className="w-full max-w-[520px]">
              <Swiper modules={[Pagination]} pagination={{ clickable: true }} className="rounded-xl overflow-hidden">
                {images.length ? (
                  images.map((src, idx) => (
                    <SwiperSlide key={idx}>
                      <div className="relative w-full aspect-square bg-white flex items-center justify-center">
                        <img
                          src={src}
                          alt={product.name}
                          className="w-full h-full object-contain animate-qv-image"
                        />
                      </div>
                    </SwiperSlide>
                  ))
                ) : (
                  <SwiperSlide>
                    <div className="relative w-full aspect-square bg-white flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  </SwiperSlide>
                )}
              </Swiper>
            </div>
          </div>

          {/* RIGHT DETAILS */}
          <div className="p-6 flex flex-col">
            <span className="text-[#9a864c] text-xs uppercase tracking-widest mb-1">
              {product.fragranceType || "Fragrance"}
            </span>

            <h2 className="text-3xl font-[Cormorant_Garamond] font-semibold text-[#1b180d] mb-3">
              {product.name}
            </h2>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating || 0)
                        ? "text-[#b28c34]"
                        : "text-[#e7e1cf]"
                    }`}
                  />
                ))}
              </div>

              <div className="text-sm text-[#5f544e]">
                {(product.rating || 0).toFixed(1)} • {product.reviewCount || 0} reviews
              </div>
            </div>

            {/* PRICE + DISCOUNT */}
<div className="flex items-center gap-2 mb-4">

  {/* PRICE */}
  <span className={`text-[#B68A3A] text-3xl font-extrabold ${cormorant.className}`}>
    ₹{variant.price}
  </span>

  {/* MRP */}
  {variant.mrp && (
    <span className=" line-through text-gray-400 text-sm">
      ₹{variant.mrp}
    </span>
  )}

  {/* GREEN ROUND SAVE BADGE */}
  {variant.mrp > variant.price && (
    <span className="bg-[#2baf5c] text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
      SAVE {Math.round(((variant.mrp - variant.price) / variant.mrp) * 100)}%
    </span>
  )}

</div>


            {/* SIZE SELECTOR */}
            {product.variants?.length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-medium text-[#1b180d] mb-2">Select Size</div>
                <div className="flex gap-2 flex-wrap">
                  {product.variants.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => setVariantIndex(i)}
                      className={`px-4 py-2 rounded-full border-2 text-sm ${
                        variantIndex === i
                          ? "bg-[#b28c34] text-white border-[#b28c34]"
                          : "bg-white border-[#e7e1cf] text-[#3b3024]"
                      }`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QUANTITY — only show on DESKTOP */}
            <div className="hidden md:flex items-center gap-4 mb-6">
            <div className="flex items-center border border-[#e7e1cf] rounded-full overflow-hidden">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-2 cursor-pointer">
                <Minus className="w-4 h-4" />
                </button>
                <div className="px-6 py-2 font-semibold">{qty}</div>
                <button onClick={() => setQty((q) => q + 1)} className="px-4 py-2 cursor-pointer">
                <Plus className="w-4 h-4" />
                </button>
            </div>
            </div>


            {/* DESKTOP BUTTONS */}
            <div className="hidden md:flex gap-3 mb-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 rounded-full bg-[#b28c34] text-white font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </button>

              <button
                onClick={handleBuyNow}
                className="flex-1 py-3 rounded-full border border-[#1b180d] text-[#1b180d] font-semibold cursor-pointer"
              >
                Buy Now
              </button>
            </div>

            {/* VIEW FULL DETAILS */}
            <button
              onClick={viewDetails}
              className="mt-auto w-full py-2 rounded-full border border-[#b28c34] text-[#b28c34] text-sm flex items-center justify-center gap-2 hover:bg-[#b28c34] hover:text-white transition cursor-pointer"
            >
              View Full Product Details <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* MOBILE ACTION BAR */}
        
            <div className="md:hidden fixed left-4 right-4 bottom-4 z-999999">
            <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-lg px-3 py-2 flex items-center gap-3">

                {/* DYNAMIC PRICE MULTIPLIED BY QTY */}
                <div className="flex-1">
                <div className="text-sm font-semibold text-[#1b180d]">
                    ₹{(variant.price * qty).toLocaleString()}
                </div>
                <div className="text-[10px] text-[#5f544e]">
                    {qty} × ₹{variant.price}
                </div>
                </div>

                {/* MOBILE QUANTITY CONTROLS (compact) */}
                <div className="flex items-center border border-[#e7e1cf] rounded-full overflow-hidden mr-1">
                <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="px-3 py-2"
                >
                    <Minus className="w-3 h-3" />
                </button>

                <div className="px-3 py-1 text-sm font-semibold text-[#1b180d]">
                    {qty}
                </div>

                <button
                    onClick={() => setQty((q) => q + 1)}
                    className="px-3 py-2"
                >
                    <Plus className="w-3 h-3" />
                </button>
                </div>

                {/* ADD TO CART */}
                <button
                onClick={handleAddToCart}
                className="px-3 py-1 rounded-full bg-[#b28c34] text-white font-semibold whitespace-nowrap"
                >
                ADD
                </button>

                {/* BUY NOW */}
                <button
                onClick={handleBuyNow}
                className="px-3 py-1 rounded-full border border-[#1b180d] text-[#1b180d] font-normal whitespace-nowrap"
                >
                BUY
                </button>
            </div>
            </div>
      </div>

      {/* ANIMATIONS */}
      <style jsx>{`
        .animate-qv-image {
          animation: qvFade 0.45s ease-out both;
        }
        @keyframes qvFade {
          from {
            opacity: 0;
            transform: translateY(6px) scale(0.995);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
