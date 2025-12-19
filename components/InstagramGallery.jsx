"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Instagram, Play } from "lucide-react";

// 👉 Replace thumbnails with your real reel covers later
const instagramReels = [
  {
    id: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=300&h=500&fit=crop",
    instagramUrl: "https://www.instagram.com/ravenfragrance.in/",
  },
  {
    id: 2,
    thumbnail:
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=300&h=500&fit=crop",
    instagramUrl: "https://www.instagram.com/ravenfragrance.in/",
  },
  {
    id: 3,
    thumbnail:
      "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=300&h=500&fit=crop",
    instagramUrl: "https://www.instagram.com/ravenfragrance.in/",
  },
  {
    id: 4,
    thumbnail:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=300&h=500&fit=crop",
    instagramUrl: "https://www.instagram.com/ravenfragrance.in/",
  },
  {
    id: 5,
    thumbnail:
      "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=300&h=500&fit=crop",
    instagramUrl: "https://www.instagram.com/ravenfragrance.in/",
  },
  {
    id: 6,
    thumbnail:
      "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?w=300&h=500&fit=crop",
    instagramUrl: "https://www.instagram.com/ravenfragrance.in/",
  },
  {
    id: 7,
    thumbnail:
      "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=300&h=500&fit=crop",
    instagramUrl: "https://www.instagram.com/ravenfragrance.in/",
  },
  {
    id: 8,
    thumbnail:
      "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=300&h=500&fit=crop",
    instagramUrl: "https://www.instagram.com/ravenfragrance.in/",
  },
];

// duplicate for infinite loop
const duplicatedReels = [...instagramReels, ...instagramReels];

export default function InstagramGallery() {
  const scrollRef = useRef(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animationId;
    let scrollPosition = 0;
    const speed = 0.5;

    const scroll = () => {
      scrollPosition += speed;
      const halfWidth = container.scrollWidth / 2;

      if (scrollPosition >= halfWidth) {
        scrollPosition = 0;
      }

      container.scrollLeft = scrollPosition;
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    const pause = () => cancelAnimationFrame(animationId);
    const resume = () => {
      scrollPosition = container.scrollLeft;
      animationId = requestAnimationFrame(scroll);
    };

    container.addEventListener("mouseenter", pause);
    container.addEventListener("mouseleave", resume);

    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener("mouseenter", pause);
      container.removeEventListener("mouseleave", resume);
    };
  }, []);

  const handleClick = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="py-16 md:py-24 bg-[#fcfbf8] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-10 text-center">
        <motion.a
          href="https://www.instagram.com/ravenfragrance.in/"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200 }}
          className="inline-flex items-center gap-2 bg-linear-to-r from-pink-500 via-purple-500 to-orange-500 text-white px-5 py-2 rounded-full mb-6 hover:shadow-lg"
        >
          <Instagram className="w-5 h-5" />
          <span className="font-[Manrope,sans-serif]">@ravenfragrance.in</span>
        </motion.a>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-serif text-3xl md:text-5xl text-[#1b180d] mb-3"
        >
          Watch Our{" "}
          <span className="text-[#b28c34]">Reels</span>
        </motion.h2>

        <p className="text-[#1b180d]/70 font-[Manrope,sans-serif]">
          Tap to watch on Instagram
        </p>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-hidden px-4 cursor-grab"
      >
        {duplicatedReels.map((reel, index) => (
          <motion.div
            key={`${reel.id}-${index}`}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: (index % 8) * 0.05 }}
            onClick={() => handleClick(reel.instagramUrl)}
            className="relative shrink-0 w-40 sm:w-[180px] md:w-[200px] aspect-9/16 rounded-2xl overflow-hidden group cursor-pointer border border-[#e7e1cf]"
          >
            <img
              src={reel.thumbnail}
              alt="Instagram Reel"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

            {/* play */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:bg-white/30 transition">
                <Play className="w-6 h-6 text-white fill-white ml-1" />
              </div>
            </div>

            {/* insta icon */}
            <div className="absolute top-3 right-3">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-pink-500 via-purple-500 to-orange-500 flex items-center justify-center">
                <Instagram className="w-4 h-4 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Follow CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="text-center mt-10"
      >
        <a
          href="https://www.instagram.com/ravenfragrance.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[#9a864c] hover:text-[#b28c34] font-[Manrope,sans-serif] transition"
        >
          <span>Follow for more</span>
          <Instagram className="w-5 h-5" />
        </a>
      </motion.div>
    </section>
  );
}
