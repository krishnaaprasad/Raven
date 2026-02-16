"use client";

import { useRef } from "react";
import ProductCard from "@/app/collection/components/ProductCard";
import { useQuickView } from "@/app/context/QuickViewContext";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ProductCarousel({ products = [] }) {
  const scrollRef = useRef(null);
  const { openQuickView } = useQuickView();

  const selectedSlugs = ["lucifer", "oud-intense", "mystique"];

  const filteredProducts = products.filter((p) =>
    selectedSlugs.includes(p.slug)
  );

  return (
    <section className="py-8 sm:py-12 md:py-14 bg-(--theme-soft) transition-colors duration-500">
      <div className="mx-auto px-4 sm:px-6">

        {/* HEADER */}
        <div className="flex flex-col justify-center items-center mb-8 gap-3 text-center">
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

        {/* MOBILE GRID */}
        <div className="grid grid-cols-2 gap-4 px-1 sm:hidden">
          {filteredProducts.map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              onQuickView={openQuickView}
            />
          ))}
        </div>

        {/* DESKTOP SLIDER */}
        <div
          ref={scrollRef}
          className="
            hidden sm:flex 
            gap-4 sm:gap-5 lg:gap-6 
            overflow-x-auto 
            scrollbar-hide 
            px-2 pb-6 
            snap-x snap-mandatory 
            justify-center
          "
        >
          {filteredProducts.map((p) => (
            <div
              key={p._id}
              className="w-full sm:w-[260px] lg:w-[375px]"
            >
              <ProductCard
                product={p}
                onQuickView={openQuickView}
              />
            </div>
          ))}
        </div>

        {/* ✅ VIEW ALL PRODUCTS BUTTON */}
        <div className="mt-6 sm:mt-6 flex justify-center">
          <Link
            href="/collection"
            className="
              group inline-flex bg-(--theme-bg) items-center gap-2
              text-xs sm:text-sm uppercase tracking-widest
              text-(--theme-text)
              border border-(--theme-border)
              px-10 py-3
              transition-all duration-300
              hover:bg-(--theme-soft)
              hover:shadow-sm
            "
          >
            View All Products
            
          </Link>
        </div>

      </div>
    </section>
  );
}
