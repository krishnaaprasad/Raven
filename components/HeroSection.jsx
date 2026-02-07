"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { useTheme } from "@/app/theme-provider";

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

  const { theme } = useTheme(); // ✅ hook inside component

  const isDesktop =
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 1024px)").matches;

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ SAFE theme-based image selection
  const heroImage = mounted
    ? theme === "dark"
      ? "/Hero-Black.PNG"
      : "/Hero-White.JPEG"
    : "/Hero-Black.PNG";
    

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
      className="relative min-h-screen overflow-hidden flex items-center justify-center -mt-12"
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
          src={heroImage}
          alt="Raven Fragrance Hero"
          fill
          priority
          className="object-cover"
        />
      </motion.div>

      {/* ===== OVERLAY ===== */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div
          className="
            absolute top-1/2 left-1/2
            -translate-x-1/2 -translate-y-1/2
            w-[120%] h-[60%]
            bg-gradient-to-b
            from-black/55 via-black/35 to-transparent
            blur-2xl
          "
        />
      </div>

      {/* ===== CONTENT ===== */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 30 }}
          transition={{ duration: 1 }}
          className={`${theme === "dark" ? "text-[#eaeaea]" : "text-neutral-900"} text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl
          leading-tight mb-6 drop-shadow-[0_6px_20px_rgba(0,0,0,0.35)]
          ${cormorant.className}`}
        >
          Presence Over Noise
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
          transition={{ duration: 1, delay: 0.3 }}
          className={`max-w-2xl mx-auto ${theme === "dark" ? "text-white/90" : "text-neutral-800"} drop-shadow-[0_2px_10px_rgba(0,0,0,0.25)]
          text-sm sm:text-base md:text-lg leading-relaxed px-2
          ${outfit.className}`}
        >
          Raven Fragrance crafted for those who prefer restraint over excess.
          <span className="hidden sm:inline"><br /></span>{" "}
          Presence that is felt, not performed.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 flex justify-center"
        >
          <Link
            href="/collection"
            className="group inline-flex items-center gap-3 px-10 py-4 mt-12 sm:mt-20 font-bold
            text-[#EAEAEA] uppercase tracking-[0.25em] text-xs sm:text-sm transition"
          >
            Three Signatures
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
