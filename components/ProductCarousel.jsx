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

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-(--theme-soft) transition-colors duration-500">
      <div className="mx-auto px-4 sm:px-6 ">

        {/* HEADER */}
        <div className="flex flex-col justify-center items-center mb-6 gap-3 text-center">

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

        {/* Shop All button */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-center sm:justify-end">
            <Link
              href="/collection"
              className="
                group inline-flex items-center gap-2
                text-xs sm:text-sm uppercase tracking-widest
                text-(--theme-text)
                border border-(--theme-border)
                px-6 py-3
                transition-all duration-300
                hover:bg-(--theme-bg)
                hover:shadow-sm
              "
            >
              Shop All
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
</div>
        {/* ----------------------------- */}
        {/* MOBILE GRID VERSION */}
        {/* ----------------------------- */}
        <div className="grid grid-cols-2 gap-4 px-1 sm:hidden">
          {products
            .filter((p) => selectedSlugs.includes(p.slug))
            .map((p) => (
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
                className="w-full sm:w-[260px] lg:w-[375px]"
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
