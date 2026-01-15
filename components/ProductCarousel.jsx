"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
// import ProductCard from "./ProductCard";
import ProductCard from "@/app/collection/components/ProductCard";
import { Outfit, Cormorant_Garamond } from "next/font/google";
import { useQuickView } from "@/app/context/QuickViewContext";

const outfit = Outfit({ subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export default function ProductCarousel({ products = [] }) {
  const scrollRef = useRef(null);
  const { openQuickView } = useQuickView();
  const scroll = (dir) => {
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      scrollRef.current.scrollBy({
        left: dir === "left" ? -width * 0.7 : width * 0.7,
        behavior: "smooth",
      });
    }
  };
  const selectedSlugs = ["rebel", "escape", "oud-intense","mystique"];


  return (
    <section className="py-10 sm:py-18 md:py-20 lg:py-12 bg-[#ffffff]">
      <div className="mx-auto px-4 sm:px-9">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-center items-end mb-10 px-4 gap-4">

          <div className="text-center">
            {/* <span className={`text-[#B68A3A] uppercase tracking-[0.25em] text-xs block mb-2 ${outfit.className}`}>
              Our Collection
            </span> */}

            <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#3B3024] ${cormorant.className}`}>
              The Collection
            </h2>

            <p className={`text-[#3a3733] text-lg sm:text-xl mt-2 max-w-[900px] mx-auto sm:mx-0 py-4 ${outfit.className}`}>
              Designed for daily wear, lasting presence, and controlled projection.<br/>Fragrances that stay close, evolve slowly, and leave an impression without demanding attention.
            </p>

            <span className={`text-[#31302d] uppercase font-semibold tracking-[0.20em] italic text-sm block mb-2 py-4 -skew-x-6 ${outfit.className}`}>
              Each Created With Purpose
            </span> 
          </div>

           

          {/* ARROWS (hidden on mobile) */}
          {/* <div className="hidden sm:flex gap-2 sm:gap-3">
            <button
              onClick={() => scroll("left")}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-[#E6DDCF] hover:border-[#B68A3A] flex items-center justify-center transition"
            >
              <ChevronLeft className="w-6 h-6 text-[#7C6E5A]" />
            </button>

            <button
              onClick={() => scroll("right")}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-[#E6DDCF] hover:border-[#B68A3A] flex items-center justify-center transition"
            >
              <ChevronRight className="w-6 h-6 text-[#7C6E5A]" />
            </button>
          </div> */}
        </div>

        {/* ----------------------------- */}
        {/* MOBILE GRID VERSION (2 columns) */}
        {/* ----------------------------- */}
        <div className="grid grid-cols-2 gap-4 px-2 sm:hidden">
          {products.map((p) => (
            <ProductCard
      key={p._id}
      product={p}
      onQuickView={openQuickView}
    />
          ))}
        </div>

        {/* ----------------------------- */}
        {/* DESKTOP SLIDER VERSION        */}
        {/* ----------------------------- */}
        <div
          ref={scrollRef}
          className="hidden sm:flex gap-4 sm:gap-5 lg:gap-6 overflow-x-auto scrollbar-hide px-4 pb-4 snap-x snap-mandatory justify-center"
        >
          {products
  .filter(p => selectedSlugs.includes(p.slug))
  .map((p) => (
    <div key={p._id} className="shrink-0 w-[220px] lg:w-[260px] xl:w-[290px]">
      <ProductCard
        product={p}
        onQuickView={openQuickView}
      />
    </div>
))}


        </div>

      </div>
    </section>
  );
}
