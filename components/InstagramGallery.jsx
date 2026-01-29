'use client';

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Instagram,
  Play,
  Users,
  Heart,
  Star,
} from "lucide-react";

const instagramReels = [
  {
    id: 1,
    thumbnail: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=300&h=500&fit=crop",
    instagramUrl: "https://www.instagram.com/ravenfragrance.in/",
    views: "12.5K",
  },
  {
    id: 2,
    thumbnail: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=300&h=500&fit=crop",
    instagramUrl: "https://www.instagram.com/ravenfragrance.in/",
    views: "8.2K",
  },
  {
    id: 3,
    thumbnail: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=300&h=500&fit=crop",
    instagramUrl: "https://www.instagram.com/ravenfragrance.in/",
    views: "15.1K",
  },
  {
    id: 4,
    thumbnail: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=300&h=500&fit=crop",
    instagramUrl: "https://www.instagram.com/ravenfragrance.in/",
    views: "9.8K",
  },
  {
    id: 5,
    thumbnail: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=300&h=500&fit=crop",
    instagramUrl: "https://www.instagram.com/ravenfragrance.in/",
    views: "11.3K",
  },
  {
    id: 6,
    thumbnail: "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?w=300&h=500&fit=crop",
    instagramUrl: "https://www.instagram.com/ravenfragrance.in/",
    views: "7.6K",
  },
];

const duplicatedReels = [...instagramReels, ...instagramReels];

export default function InstagramGallery() {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let raf;
    let pos = el.scrollLeft;
    const speed = 0.5;

    const loop = () => {
      if (!isPaused) {
        pos += speed;
        const half = el.scrollWidth / 2;
        if (pos >= half) pos = 0;
        el.scrollLeft = pos;
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isPaused]);

  const handleClick = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="py-20 bg-(--theme-soft) overflow-hidden transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 mb-14">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-[Cormorant_Garamond] text-3xl sm:text-4xl md:text-5xl font-semibold text-(--theme-text) mb-4">
            Loved by Fragrance Lovers
          </h2>

          <p className="font-[Outfit] text-base sm:text-lg text-(--theme-muted) max-w-2xl mx-auto mb-12">
            Real moments from our community who wear Raven Fragrance every day.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-10 md:gap-20">
            {[
              { icon: Users, value: "50K+", label: "Happy Customers" },
              { icon: Star, value: "4.9", label: "Average Rating" },
              { icon: Heart, value: "25K+", label: "Community Members" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <item.icon className="w-5 h-5 text-(--theme-muted)" />
                  <span className="font-[Outfit] text-xl md:text-3xl font-semibold text-(--theme-text)">
                    {item.value}
                  </span>
                </div>
                <p className="font-[Outfit] text-sm text-(--theme-muted)">
                  {item.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="flex gap-4 overflow-x-hidden px-4"
      >
        {duplicatedReels.map((reel, index) => (
          <motion.div
            key={`${reel.id}-${index}`}
            whileHover={{ scale: 1.03, y: -6 }}
            transition={{ duration: 0.3 }}
            onClick={() => handleClick(reel.instagramUrl)}
            className="
              relative shrink-0 w-40 sm:w-[180px] md:w-[200px] aspect-9/16 
              rounded-2xl overflow-hidden cursor-pointer group 
              shadow-lg bg-(--theme-soft)
              border border-(--theme-border)
            "
          >
            <img
              src={reel.thumbnail}
              alt="Raven Fragrance Reel"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-70 group-hover:opacity-85 transition" />

            {/* Play */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/25 backdrop-blur flex items-center justify-center border border-white/40">
                <Play className="w-5 h-5 text-white fill-white ml-1" />
              </div>
            </div>

            {/* Bottom */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-[Outfit]">
              <div className="flex items-center gap-1">
                <Play className="w-3 h-3 fill-white" />
                <span>{reel.views}</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-linear-to-br from-pink-500 via-purple-500 to-orange-400 flex items-center justify-center">
                <Instagram className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            {/* Hover label */}
            <div className="absolute top-4 right-3 opacity-0 group-hover:opacity-100 transition">
              <div className="bg-black/60 rounded-full px-2.5 py-1 text-[10px] font-[Outfit] text-white">
                Watch on Instagram
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-6 mt-10"
      >
        <p className="text-center font-[Outfit] text-sm text-(--theme-muted)">
          Real stories from our customers • Tap to explore on Instagram
        </p>
      </motion.div>
    </section>
  );
}
