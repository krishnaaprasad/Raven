"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useTheme } from "@/app/theme-provider";

export default function HeroSection() {
  const { theme } = useTheme();

  // Desktop paths
  const desktopLight = "/hero-desktop-light.PNG";
  const desktopDark = "/hero-desktop-dark.PNG";
  // Mobile paths
  const mobileLight = "/hero-mobile-light.PNG";
  const mobileDark = "/hero-mobile-dark.PNG";

  return (
    <section className="bg-(--theme-bg) relative min-h-svh overflow-hidden flex items-center justify-center -mt-12">
      
      {/* ===================== */}
      {/* DESKTOP HERO VIEW */}
      {/* ===================== */}
      <div className="hidden md:block absolute inset-0">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={`desktop-${theme}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full h-full absolute inset-0"
          >
            <Image
              src={theme === "dark" ? desktopDark : desktopLight}
              alt="Raven Fragrance Collection Desktop"
              fill
              priority
              fetchPriority="high"
              loading="eager"
              quality={90}
              className="object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Silent Preloaders for Instant Switch */}
        <div className="hidden">
           <Image src={desktopLight} alt="preload" width={1} height={1} />
           <Image src={desktopDark} alt="preload" width={1} height={1} />
        </div>
      </div>

      {/* ===================== */}
      {/* MOBILE HERO VIEW */}
      {/* ===================== */}
      <div className="md:hidden absolute inset-0 w-full h-full">
        <AnimatePresence mode="popLayout" initial={false}>
          {/* We ensure a absolute positioning container for each image during fade */}
          <motion.div
            key={`mobile-${theme}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full h-full absolute inset-0"
          >
            <Image
              src={theme === "dark" ? mobileDark : mobileLight}
              alt="Raven Fragrance Collection Mobile"
              fill
              priority
              fetchPriority="high"
              loading="eager"
              quality={90}
              className="w-full h-full object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        {/* mobile preloaders */}
        <div className="hidden">
           <Image src={mobileLight} alt="preload" width={1} height={1} />
           <Image src={mobileDark} alt="preload" width={1} height={1} />
        </div>
      </div>

    </section>
  );
}
