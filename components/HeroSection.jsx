"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTheme } from "@/app/theme-provider";

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const desktopImage =
    theme === "dark"
      ? "/hero-desktop-dark.PNG"
      : "/hero-desktop-light.PNG";

  const mobileImage =
    theme === "dark"
      ? "/hero-mobile-dark.PNG"
      : "/hero-mobile-light.PNG";

  return (
    <section className="bg-(--theme-bg)
    relative
    min-h-svh
    overflow-hidden
    flex
    items-center
    justify-center
    -mt-12 ">

      {/* ===================== */}
      {/* DESKTOP HERO IMAGE */}
      {/* ===================== */}
      <div className="hidden md:flex absolute inset-0 items-center justify-center">
        <motion.div
          key={`desktop-${theme}`}
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="w-full h-full"
        >
          <Image
            src={desktopImage}
            alt="Raven Fragrance Collection"
            fill
            priority
            className="object-cover object-center"
          />
        </motion.div>
      </div>

      {/* ===================== */}
      {/* MOBILE HERO IMAGE */}
      {/* ===================== */}
      <div className="flex md:hidden absolute inset-0 items-center justify-center">
        <motion.div
          key={`mobile-${theme}`}
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="w-full h-full"
        >
          <Image
            src={mobileImage}
            alt="Raven Fragrance Collection"
            fill
            priority
            className="object-cover object-center"
          />
        </motion.div>
      </div>

      
    </section>
  );
}
