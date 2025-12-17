"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { motion, AnimatePresence } from 'framer-motion';

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600"],
  style: ["italic"],
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
});


export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  /* ⭐ PRODUCT SLIDER STATE */
  const [products, setProducts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState(1); // 1 = next, -1 = prev
  const touchStartX = useRef(null);

const handleTouchStart = (e) => {
  touchStartX.current = e.touches[0].clientX;
};

const handleTouchEnd = (e) => {
  if (!touchStartX.current) return;

  const diff = touchStartX.current - e.changedTouches[0].clientX;

  if (diff > 60) {
    nextSlide(); // swipe left
  } else if (diff < -60) {
    prevSlide(); // swipe right
  }

  touchStartX.current = null;
};

const handleClickZone = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const clickX = e.clientX - rect.left;

  if (clickX < rect.width / 2) {
    prevSlide();
  } else {
    nextSlide();
  }
};
  

  useEffect(() => {
    setIsVisible(true);
  }, []);

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products?limit=5");
        const data = await res.json();
        setProducts(data || []);
      } catch (err) {
        console.error("Hero products error", err);
      }
    }
    loadProducts();
  }, []);

  /* ================= AUTO SLIDE ================= */
useEffect(() => {
  if (!products.length) return;

  intervalRef.current = setInterval(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % products.length);
  }, 4000);

  return () => clearInterval(intervalRef.current);
}, [products]);

 const nextSlide = () => {
  setDirection(1);
  setActiveIndex((prev) => (prev + 1) % products.length);
};

const prevSlide = () => {
  setDirection(-1);
  setActiveIndex((prev) =>
    prev === 0 ? products.length - 1 : prev - 1
  );
};

const activeProduct = products[activeIndex];



const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    setMousePosition({ x: x * 20, y: y * 20 });
  };

/* ================= ANIMATION VARIANTS ================= */
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? -120 : 120,
      opacity: 0,
    }),
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-dvh overflow-hidden bg-linear-to-br from-cream via-background to-cream-muted"
    >
      {/* ================= DECORATIVE BACKGROUND ================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[#b28c34]/10 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-[#b28c34]/10 blur-3xl animate-float [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-[#b28c34]/5 blur-2xl animate-float [animation-delay:4s]" />

        {/* GRID */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-[#1b180d]"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 min-h-dvh">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center min-h-screen py-15">

          {/* ================= LEFT ================= */}
          <div
            className={`order-2 lg:order-1 text-center lg:text-left transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
            >
            {/* TAG */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/20 mb-6 transition-all duration-700 delay-200 ${
                isVisible ? "opacity-100" : "opacity-0 translate-y-4"
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#b28c34] " />
              <span
                className={`text-xs sm:text-sm uppercase tracking-[0.2em] text-[#b28c34] leading-5 ${outfit.className}`}
                >
                Premium Artisan Fragrances
                </span>
            </div>

            {/* TITLE */}
            <h1 className="font-serif text-7xl font-semibold sm:text-8xl xl:text-8xl text-[#1b180d] leading-tight mb-6">
              Unveil
              <span
                className={`block italic sm:text-8xl text-7xl font-bold relative mt-0 text-gold-gradient bg-clip-text ${cormorant.className}`}>
                Your Essence
                <svg
                  className="absolute -bottom-2 left-0 w-full max-w-[300px]"
                  viewBox="0 0 300 12"
                >
                  <path
                    d="M0 6 Q75 0, 150 6 T300 6"
                    fill="none"
                    stroke="#b28c34"
                    strokeWidth="2"
                    opacity="0.6"
                  />
                </svg>
              </span>
            </h1>

            {/* DESCRIPTION */}
            <p className="text-[#5f544e] max-w-md mx-auto lg:mx-0 text-lg mb-8 font-[Manrope,sans-serif]">
              Discover fragrances that reveal, not mask. Each note crafted with rare botanicals to create{" "}
              <span className="text-[#b28c34] font-medium">a scent uniquely yours</span>.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/product">
                <button className="group relative px-10 py-4 rounded-full bg-[#b68615] text-white font-semibold shadow-xl overflow-hidden cursor-pointer">
                  <span className="relative z-10 flex text-base sm:text-xl items-center gap-2">
                    Explore Collection
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                  </span>
                  <span className="absolute inset-0 bg-linear-to-r from-[#9a864c] to-[#b28c34] opacity-0 group-hover:opacity-100 transition" />
                </button>
              </Link>

              <Link href="/WhyChooseRaven">
                <button className="px-8 py-4 rounded-full border border-[#1b180d]/20 text-[#000000] hover:bg-[#1b180d] hover:text-[#fcfbf8] transition cursor-pointer">
                  Our Story
                </button>
              </Link>
            </div>

            {/* TRUST */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 mt-12 pt-10 border-t border-[#1b180d]/10">
              {[
                { value: "100%", label: "Natural" },
                { value: "20+", label: "Ingredients" },
                { value: "500+", label: "Customers" },
              ].map((b) => (
                <div key={b.label}>
                  <div className="text-xl sm:text-3xl font-serif text-[#b28c34]">{b.value}</div>
                  <div className="text-xs sm:text-sm tracking-widest text-[#5f544e] uppercase">
                    {b.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= RIGHT ================= */}
          <div
            className={`order-1 lg:order-2 relative transition-all duration-1000 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            onMouseEnter={() => clearInterval(intervalRef.current)}
            onMouseLeave={() => {
              intervalRef.current = setInterval(() => {
                setActiveIndex((prev) => (prev + 1) % products.length);
              }, 4000);
            }}
            onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
              onTouchEnd={(e) => {
                if (!touchStartX.current) return;
                const diff = touchStartX.current - e.changedTouches[0].clientX;
                if (diff > 50) nextSlide();
                if (diff < -50) prevSlide();
                touchStartX.current = null;
              }}
            >

            <div className="absolute -inset-6 border border-[#b28c34]/20 rounded-3xl -rotate-3" />
            <div className="absolute -inset-4 border border-[#b28c34]/10 rounded-3xl rotate-2" />

            <AnimatePresence custom={direction} mode="wait">
            {activeProduct && (
            <div
                className={`relative aspect-3/4 max-w-md mx-auto transition-all duration-500 ease-out
                    ${isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}
                `}
                style={{
                    transform: `perspective(1000px) rotateY(${mousePosition.x * 0.5}deg) rotateX(${-mousePosition.y * 0.5}deg)`,
                }}
                >
              <div className="absolute inset-0 bg-[#b28c34]/20 blur-2xl rounded-2xl scale-110 animate-pulse" />

              {/* IMAGE */}
                <Link href={`/product/${activeProduct.slug}`}>
                  <div className="relative h-full rounded-2xl overflow-hidden border border-[#b28c34]/20 shadow-2xl cursor-pointer">
                    {/* INTERACTION LAYER */}
                    <div
                      className="absolute inset-0 z-20"
                      onClick={handleClickZone}
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleTouchEnd}
                    />
                    <Image
                      key={activeProduct.slug}
                      src={activeProduct.images?.[0]?.original || "/placeholder.jpg"}
                      alt={activeProduct.name}
                      fill
                      sizes="(max-width: 768px) 90vw, 500px"
                      className={`absolute inset-0 transition-all duration-700 ease-in-out
                        ${direction === 1 ? "animate-slide-left" : "animate-slide-right"}
                      `}
                      priority={activeIndex === 0}
                    />

                  <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
                  </div>
                  

                <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />

                {/* PRODUCT CARD */}
                    <div className="absolute bottom-5 left-5 right-5 bg-[#fcfbf8]/85 backdrop-blur rounded-xl p-2 border border-[#b28c34]/20">
                      <p className={`text-lg text-[#1b180d] ${cormorant.className}`}>
                        {activeProduct.name}
                      </p>

                      <div className="flex justify-between items-end mt-2">
                        <div>
                          <p className="text-sm line-through text-[#5f544e]">
                            ₹{activeProduct.variants?.[0]?.mrp}
                          </p>
                          <p className="text-xl font-semibold text-[#b28c34]">
                            ₹{activeProduct.variants?.[0]?.price}
                          </p>
                        </div>

                        <span
                          className={`text-xs uppercase tracking-widest text-[#b28c34] ${outfit.className}`}
                        >
                          Shop Now ➜
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
                

              {/* FLOATING BADGE */}
              <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-[#c59118] flex items-center justify-center shadow-xl animate-float">
                <span className="text-white text-sm font-semibold text-center">
                  NEW<br />2025
                </span>
              </div>
            </div>
            )}
            </AnimatePresence>

          </div>
        </div>
      </div>

      {/* SCROLL INDICATOR */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        <span className="text-xs uppercase tracking-widest text-[#5f544e] hidden sm:block">
          Discover More
        </span>
        <div className="w-6 h-10 border-2 border-[#1b180d]/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-[#b28c34] rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
