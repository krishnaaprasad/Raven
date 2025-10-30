"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Marquee from "react-fast-marquee";

export default function HomeMarquee() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <AnimatePresence mode="wait">
      {isHomePage && (
        <motion.div
          key="homepage-marquee"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="relative bg-black text-white text-sm py-2 top-0 z-50 overflow-hidden"
        >
          {/* Left Fade */}
          <div className="absolute left-0 top-0 h-full w-17 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
          {/* Right Fade */}
          <div className="absolute right-0 top-0 h-full w-17 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />

          <Marquee
            pauseOnHover
            pauseOnClick
            gradient={false} // disable built-in gradient
            speed={60}
            className="px-8"
          >
            20% OFF ON ALL PERFUMES TODAY! &nbsp;&nbsp;&nbsp;
            FREE SHIPPING ON ORDERS OVER ₹999! &nbsp;&nbsp;&nbsp;
          </Marquee>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
