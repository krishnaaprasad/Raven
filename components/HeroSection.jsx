"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Cormorant_Garamond, Outfit } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["italic"],
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const isDesktop =
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 1024px)").matches;

  useEffect(() => {
    setMounted(true);
  }, []);

  const onMouseMove = (e) => {
    if (!isDesktop) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMouse({
      x: (e.clientX - rect.width / 2) * 0.015,
      y: (e.clientY - rect.height / 2) * 0.015,
    });
  };

  return (
    <section
  onMouseMove={onMouseMove}
  className="relative min-h-screen overflow-hidden  flex items-center justify-center -mt-12"
>

      {/* ===== BACKGROUND IMAGE ===== */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        animate={{
          scale: 1.05,
          x: isDesktop ? mouse.x : 0,
          y: isDesktop ? mouse.y : 0,
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Image
          src="/hero-abstract.jpg"
          alt="Raven Fragrance Hero"
          fill
          priority
          className="object-cover"
        />
      </motion.div>
      
    
      
     

      {/* ===== CONTENT ===== */}
            <div className="absolute inset-0 z-1 pointer-events-none">
        <div className="
          absolute
          top-1/2 left-1/2
          -translate-x-1/2 -translate-y-1/2
          w-[120%] h-[60%]
          bg-linear-to-b
          from-black/40
          via-black/25
          to-transparent
          blur-2xl
        " />
      </div>
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 30 }}
          transition={{ duration: 1 }}
          className={`text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-tight mb-6 ${cormorant.className}`}
        >
          Presence Over Noise
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
          transition={{ duration: 1, delay: 0.3 }}
          className={`max-w-2xl mx-auto text-white/85 text-sm sm:text-base md:text-lg leading-relaxed px-2 ${outfit.className}`}
        >
          Fragrance with intention. Strength held back. For those who understand
          that true presence doesn’t need to announce itself -{" "}
          <span className="text-[#b63939] font-medium">it’s felt</span>, not
          performed.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 flex justify-center"
        >
          <Link
            href="/collection"
            className="group inline-flex items-center gap-3 px-10 py-4  text-white uppercase tracking-[0.25em] text-xs sm:text-xs transition"
          >
            Explore Collection
            <ArrowRight className="w-4 h-4 text-[#ffffff] group-hover:translate-x-1 transition" />
          </Link>
        </motion.div>
      </div>

      {/* ===== SCROLL INDICATOR =====
      <div className="absolute bottom-12 sm:bottom-15 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className={`text-white/50 text-[10px] tracking-[0.3em] ${outfit.className}`}>
          SCROLL
        </span>
        <div className="w-5 h-8 border border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-[#ffffff] rounded-full animate-bounce" />
        </div>
      </div> */}
    </section>
  );
}
