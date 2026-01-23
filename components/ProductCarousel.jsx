"use client";

import { useRef } from "react";
import ProductCard from "@/app/collection/components/ProductCard";
import { useQuickView } from "@/app/context/QuickViewContext";

export default function ProductCarousel({ products = [] }) {
  const scrollRef = useRef(null);
  const { openQuickView } = useQuickView();

  const selectedSlugs = ["rebel", "escape", "oud-intense", "mystique"];

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-(--theme-bg) transition-colors duration-500">
      <div className="mx-auto px-4 sm:px-6 ">

        {/* HEADER */}
        <div className="flex flex-col justify-center items-center mb-12 gap-3 text-center">

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light text-(--theme-text) font-[Crimson_Text] tracking-tight">
            The Collection
          </h2>

          <p className="text-(--theme-muted) text-base sm:text-lg max-w-[820px] leading-relaxed font-[system-ui]">
            Designed for daily wear, lasting presence, and controlled projection.
            <br />
            Fragrances that stay close, evolve slowly, and leave an impression without demanding attention.
          </p>

          <span className="uppercase text-xs tracking-[0.25em] text-(--theme-muted) italic">
            Each Created With Purpose
          </span>
        </div>

        {/* ----------------------------- */}
        {/* MOBILE GRID VERSION */}
        {/* ----------------------------- */}
        <div className="grid grid-cols-2 gap-4 px-1 sm:hidden">
          {products.map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              onQuickView={openQuickView}
            />
          ))}
        </div>

        {/* ----------------------------- */}
        {/* DESKTOP SLIDER VERSION */}
        {/* ----------------------------- */}
        <div
          ref={scrollRef}
          className="
            hidden sm:flex 
            gap-4 sm:gap-5 lg:gap-6 
            overflow-x-auto 
            scrollbar-hide 
            px-2 pb-4 
            snap-x snap-mandatory 
            justify-center
          "
        >
          {products
            .filter((p) => selectedSlugs.includes(p.slug))
            .map((p) => (
              <div
                key={p._id}
                className="shrink-0 w-[220px] lg:w-[260px] xl:w-[290px]"
              >
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
