"use client";

import Image from "next/image";
import { useState } from "react";
import { Star, Heart, ShoppingBag } from "lucide-react";
import { Outfit, Cormorant_Garamond } from "next/font/google";

const outfit = Outfit({ subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export default function ProductCard({ product }) {
  const [liked, setLiked] = useState(false);

  const image = product?.images?.[0]?.original || "/placeholder.png";

  const price = product?.variants?.[0]?.price;
  const mrp = product?.variants?.[0]?.mrp;

  const tagline =
    product?.fragranceType || "Premium Perfume";

  return (
    <div
  className="
    group 
    w-full                   /* MOBILE GRID → full width inside each column */
    shrink-0 
    sm:w-[44vw] sm:max-w-60 
    md:w-[32vw] md:max-w-[260px] 
    lg:w-[23vw] lg:max-w-[280px] 
    xl:max-w-[300px]
  "
>

      <div className="relative overflow-hidden rounded-xl bg-[#FAF7EF] border border-[#E6DDCF] hover:border-[#B68A3A] transition-all duration-500 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.12)]">

        {/* IMAGE */}
        <div className="relative aspect-3/4 overflow-hidden">
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* GRADIENT HOVER OVERLAY */}
          <div className="absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* LIKE BUTTON */}
          <button
            onClick={() => setLiked(!liked)}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition"
          >
            <Heart
              className={`w-5 h-5 ${
                liked ? "fill-red-500 text-red-500" : "text-[#3B3024]"
              }`}
            />
          </button>

          {/* DESKTOP Add to Cart */}
          <div className="absolute bottom-3 left-3 right-3 hidden sm:block opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500">
            <button className="w-full bg-[#B68A3A] text-white py-2 rounded-full flex items-center justify-center gap-2 font-semibold shadow-md hover:brightness-110">
              <ShoppingBag className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        </div>

        {/* PRODUCT DETAILS */}
        <div className="p-4 bg-[#FDFBF5]">

          {/* RATING */}
          <div className="flex items-center gap-1 mb-1.5">
            <Star className="w-4 h-4 fill-[#B68A3A] text-[#B68A3A]" />
            <span className={`text-sm font-semibold ${outfit.className}`}>
              {product.rating || "4.8"}
            </span>
            <span className={`text-sm text-[#7C6E5A] ${outfit.className}`}>
              ({product.reviews || "200"})
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

          {/* PRICING */}
          <div className="flex items-center justify-between mt-2">
            <span className={`text-[#B68A3A] text-xl font-bold ${cormorant.className}`}>
              ₹{price}
            </span>

            {mrp && (
              <span className={`text-sm line-through text-[#7C6E5A] hidden sm:inline ${outfit.className}`}>
                ₹{mrp}
              </span>
            )}

            {/* MOBILE ADD */}
            <button className="sm:hidden w-9 h-9 rounded-full bg-[#B68A3A] flex items-center justify-center shadow-md active:scale-95 transition">
              <ShoppingBag className="w-4 h-4 text-white" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
