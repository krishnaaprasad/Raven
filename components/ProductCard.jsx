"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Star, Heart, ShoppingBag } from "lucide-react";
import { Outfit, Cormorant_Garamond } from "next/font/google";
import { useCart } from "@/app/context/cartcontext";
import { toast } from "react-hot-toast";
import { useQuickView } from "@/app/context/QuickViewContext";

const outfit = Outfit({ subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export default function ProductCard({ product, bestsellerIds = [] }) {
  if (!product) return null;

  const { addToCart } = useCart();
  const [liked, setLiked] = useState(false);

  const { openQuickView } = useQuickView();
  const [hover, setHover] = useState(false);

  const img1 = product.images?.[0]?.original;
  const img2 = product.images?.[1]?.original;

  const slug = product.slug;
  const image = product?.images?.[0]?.original || "/placeholder.png";
  const price = product?.variants?.[0]?.price || 0;
  const mrp = product?.variants?.[0]?.mrp || null;
  const size = product?.variants?.[0]?.size || "50ml";
  const tagline = product?.fragranceType || "Premium Perfume";
  const rating = product?.rating || 0;
  const reviewCount = product?.reviewCount || 0;

  // ======================================
  // ⭐ BADGE LOGIC
  // ======================================

  const isBestseller = bestsellerIds.includes(product._id);

  const isNew = (() => {
    const created = new Date(product?.createdAt);
    const daysOld = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
    return daysOld <= 60;
  })();

  const hasOffer = mrp > price;
  const discountPercent = hasOffer
    ? Math.round(((mrp - price) / mrp) * 100)
    : 0;

  // ======================================

  const handleAddToCart = () => {
    addToCart(
      {
        id: product._id,
        slug,
        name: product.name,
        price,
        size,
        image,
      },
      1
    );

    toast.success(`${product.name} added to cart`, {
      position: "top-right",
      duration: 3500,
      style: {
        background: "#3B3024",
        color: "white",
        padding: "16px 20px",
        fontSize: "16px",
        borderRadius: "10px",
        border: "1px solid #B68A3A",
        boxShadow: "0px 8px 25px rgba(0,0,0,0.25)",
      },
      iconTheme: {
        primary: "#B68A3A",
        secondary: "white",
      },
    });

    window.dispatchEvent(new Event("open-mini-cart"));
  };

  return (
    <div
      className="
        group 
        w-full 
        shrink-0 
        sm:w-[44vw] sm:max-w-60 
        md:w-[32vw] md:max-w-[260px] 
        lg:w-[23vw] lg:max-w-[280px] 
        xl:max-w-[300px]
      "
       onMouseEnter={() => setHover(true)}
       onMouseLeave={() => setHover(false)}
    >
      
      <div className="relative overflow-hidden rounded-xl bg-[#FAF7EF] border border-[#E6DDCF] hover:border-[#B68A3A] transition-all duration-500 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.12)]">
        
        {/* ---------------------- */}
        {/* BADGES ON TOP LEFT     */}
        {/* ---------------------- */}
        <div className="absolute top-3 left-3 flex  gap-1 z-20">

          {isNew && (
            <span className="px-3 md:px-4 py-1 text-[10px] md:text-[12px] rounded-full bg-[#B68A3A] text-white font-semibold uppercase tracking-wide shadow">
              NEW
            </span>
          )}

          {isBestseller && (
            <span className="px-3 md:px-4 py- text-[10px] md:text-[12px] rounded-full bg-black text-white font-semibold uppercase tracking-wide shadow">
              BESTSELLER
            </span>
          )}

          {hasOffer && (
            <span className="px-3 md:px-4 py-1 text-[10px] md:text-[12px] rounded-full bg-orange-600 text-white font-semibold uppercase shadow">
              {discountPercent}% OFF
            </span>
          )}

        </div>

        {/* IMAGE BOX — whole area is clickable */}
        <Link
          href={`/product/${slug}`}
          className="block relative aspect-3/4 overflow-hidden group"
        >
          
          {/* Make everything inside NOT block the click */}
          <div className="absolute inset-0 transition-opacity duration-700">
            <Image
              src={img1}
              alt={product.name}
              fill
              className={`object-cover transition-transform duration-700 ${
                hover ? "opacity-0" : "opacity-100 scale-105 group-hover:scale-[1.08]"
              }`}
            />
          </div>

          /* Second image on hover */
          {img2 && (
            <div className="absolute inset-0 transition-opacity duration-700">
              <Image
                src={img2}
                alt={`${product.name} alternate`}
                fill
                className={`object-cover transition-transform duration-700 ${
                  hover ? "opacity-100 scale-105" : "opacity-0"
                }`}
              />
            </div>
          )}

          /* Gradient overlay */
          <div className="absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </Link>

        {/* LIKE BUTTON — keep clickable */}
        <button
          onClick={() => setLiked(!liked)}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition pointer-events-auto z-20"
        >
          <Heart
            className={`w-5 h-5 ${liked ? "fill-red-500 text-red-500" : "text-[#3B3024]"}`}
          />
        </button>

        {/* DESKTOP Add to Cart — keep clickable */}
        <div className="absolute bottom-3 left-3 right-3 hidden sm:block opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500 pointer-events-auto z-20">
          <button
            onClick={() => openQuickView(product)}
            className="w-full bg-[#B68A3A] text-white py-2 rounded-full flex items-center justify-center gap-2 font-semibold shadow-md hover:brightness-110"
          >
            <ShoppingBag className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
        </div>

        {/* DETAILS */}
        <div className="p-4 bg-[#FDFBF5]">

          {/* RATING */}
          <div className="flex items-center gap-1 mb-1.5">
            <Star className="w-4 h-4 fill-[#B68A3A] text-[#B68A3A]" />

            <span className={`text-sm font-semibold ${outfit.className}`}>
              {product.rating?.toFixed(1) || "4.8"}
            </span>

            <span className={`text-sm text-[#7C6E5A] ${outfit.className}`}>
              ({product.reviewCount || 0})
            </span>
          </div>

          {/* TAGLINE */}
          <span className={`text-[11px] uppercase tracking-[0.15em] text-[#B68A3A] block mb-1 ${outfit.className}`}>
            {tagline}
          </span>

          {/* NAME */}
          <h3 className={`text-xl font-semibold text-[#3B3024] ${cormorant.className}`}>
            {product.name}
          </h3>

          {/* PRICE + MOBILE ADD */}
          <div className="flex items-center justify-between mt-2">

            <span className={`text-[#B68A3A] text-xl font-bold ${cormorant.className}`}>
              ₹{price}
            </span>

            {mrp && (
              <span className={`text-sm line-through text-[#7C6E5A] hidden sm:inline ${outfit.className}`}>
                ₹{mrp}
              </span>
            )}

            {/* MOBILE ADD BUTTON */}
            <button
              onClick={() => openQuickView(product)}
              className="sm:hidden w-9 h-9 rounded-full bg-[#B68A3A] flex items-center justify-center shadow-md active:scale-95 transition"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
            </button>

          </div>

        </div>
      </div>
    
  );
  
}
