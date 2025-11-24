"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Marquee from "react-fast-marquee";

export default function HomeMarquee() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const [marquee, setMarquee] = useState({
    active: true,
    lines: [],
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/marquee", { cache: "no-store" });
        const data = await res.json();
        setMarquee({
          active: data.active,
          lines: data.lines || [],
        });
      } catch (err) {
        console.error("Failed to load marquee:", err);
      }
    }
    load();
  }, []);

  if (!isHomePage || !marquee.active) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="homepage-marquee"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="relative bg-black text-white text-sm py-2 top-0 z-50 overflow-hidden"
      >
        <div className="absolute left-0 top-0 h-full w-17 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 h-full w-17 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />

        <Marquee pauseOnHover pauseOnClick gradient={false} speed={60} className="px-8">
          {marquee.lines.map((line, i) => (
            <span key={i} className="flex items-center">
              {line}
              {i !== marquee.lines.length - 1 && (
                <span className="mx-3"></span>
              )}
            </span>
          ))}
        </Marquee>
      </motion.div>
    </AnimatePresence>
  );
}
