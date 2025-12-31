"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Marquee from "react-fast-marquee";

// Lucide Icons
import { Truck, Gift, Sparkles, Info } from "lucide-react";

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

        const formatted =
          data.lines?.map((item) =>
            typeof item === "string"
              ? { text: item, icon: "Sparkles", link: "" }
              : item
          ) || [];

        setMarquee({ active: data.active, lines: formatted });
      } catch (err) {
        console.error("Failed to load marquee:", err);
      }
    }

    load();
  }, []);

  if (!isHomePage || !marquee.active || marquee.lines.length === 0) return null;

  const renderIcon = (name) => {
    switch (name) {
      case "Truck":
        return <Truck className="w-4 h-4" />;
      case "Gift":
        return <Gift className="w-4 h-4" />;
      case "Sparkles":
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="homepage-marquee"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="relative bg-[#000000] text-[#fcfbf8] text-xs font-medium uppercase tracking-wider py-2 z-50 overflow-hidden"
      >
        <Marquee pauseOnHover pauseOnClick gradient={false} speed={55} className="px-4">
          {marquee.lines.map((item, i) => {
            const content = (
              <span className="flex items-center gap-2 mx-8">
                {renderIcon(item.icon)}
                {item.text}
              </span>
            );

            return item.link ? (
              <a key={i} href={item.link} className="hover:text-[#b28c34] transition">
                {content}
              </a>
            ) : (
              <span key={i}>{content}</span>
            );
          })}
        </Marquee>
      </motion.div>
    </AnimatePresence>
  );
}
