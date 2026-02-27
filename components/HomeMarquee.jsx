"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Marquee from "react-fast-marquee";
import { Truck, Gift, Sparkles, Info } from "lucide-react";

export default function HomeMarquee() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const [marquee, setMarquee] = useState({
    active: true,
    lines: [
      {
        text: "FREE SHIPPING ON ORDERS ABOVE ₹1499!",
        icon: "Sparkles",
        link: "",
      },
    ],
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/marquee");
        if (!res.ok) return;

        const data = await res.json();
        if (!data?.lines) return;

        const formatted = data.lines.map((item) =>
          typeof item === "string"
            ? { text: item, icon: "Sparkles", link: "" }
            : item
        );

        setMarquee({
          active: data.active ?? true,
          lines: formatted.length ? formatted : marquee.lines,
        });
      } catch (err) {
        console.error("Failed to load marquee:", err);
      }
    }

    load();
  }, []);

  if (!isHomePage || !marquee.active) return null;

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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-black text-[#fcfbf8] text-xs font-medium uppercase tracking-wider py-2"
      >
        <Marquee pauseOnHover gradient={false} speed={60}>
          {marquee.lines.map((item, i) => (
            <span key={i} className="flex items-center gap-2 mx-8">
              {renderIcon(item.icon)}
              {item.text}
            </span>
          ))}
        </Marquee>
      </motion.div>
    </AnimatePresence>
  );
}