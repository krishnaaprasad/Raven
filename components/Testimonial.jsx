"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Mumbai",
    avatar: "PS",
    rating: 5,
    product: "Eclat de Luxe",
    text: "The most luxurious fragrance I've ever owned. The scent lasts all day and I receive compliments everywhere I go. Truly worth every rupee!",
  },
  {
    id: 2,
    name: "Rahul Verma",
    location: "Delhi",
    avatar: "RV",
    rating: 5,
    product: "Rebel",
    text: "Bold, sophisticated, and uniquely captivating. This perfume has become my signature scent. The quality is exceptional for the price.",
  },
  {
    id: 3,
    name: "Ananya Patel",
    location: "Bangalore",
    avatar: "AP",
    rating: 5,
    product: "Eclat de Luxe",
    text: "I was hesitant to buy perfume online, but Raven exceeded all expectations. The packaging was beautiful and the fragrance is absolutely divine.",
  },
  {
    id: 4,
    name: "Vikram Singh",
    location: "Jaipur",
    avatar: "VS",
    rating: 5,
    product: "Rebel",
    text: "Finally found a brand that understands what premium fragrance should be. The longevity is incredible — I can still smell it after 8 hours!",
  },
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % testimonials.length),
      5000
    );
    return () => clearInterval(timer);
  }, [autoPlay]);

  const t = testimonials[index];

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="
        relative overflow-hidden
        bg-linear-to-b from-[#1b180d] via-[#241f12] to-[#1b180d]
        py-14 lg:py-14
      "
    >
      {/* soft glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#b28c34_0%,transparent_60%)] opacity-20 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4">
        {/* ---------- HEADER ---------- */}
        <header className="text-center mb-16">

          <h2
            id="testimonials-heading"
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#fcfbf8]"
          >
            What Our{" "}
            <span className="italic text-[#b28c34]">Customers</span> Say
          </h2>

          <p className="mt-4 text-[#e7e1cf]/70 max-w-2xl mx-auto text-lg">
            Join hundreds of satisfied customers who have discovered their
            signature scent with Raven.
          </p>
        </header>

        {/* ---------- CARD ---------- */}
        <div className="relative max-w-4xl mx-auto">
          {/* quote icon */}
          

          <div className="
            relative rounded-3xl p-8 md:p-12
            bg-[#fcfbf8]/5 backdrop-blur
            border border-[#b28c34]/30
          ">
            <Quote className="absolute -top-8 left-8 w-24 h-24 text-[#b28c34]/20" />
            <AnimatePresence mode="wait">
                
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                {/* avatar */}
                <div className="
                  w-20 h-20 mx-auto mb-6 rounded-full
                  bg-[#b28c34] text-[#1b180d]
                  flex items-center justify-center
                  text-2xl font-serif shadow-lg
                ">
                  {t.avatar}
                </div>

                {/* stars */}
                <div className="flex justify-center gap-1 mb-6">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-[#b28c34] text-[#b28c34]"
                    />
                  ))}
                </div>

                {/* text */}
                <blockquote className="
                  text-[#fcfbf8] text-lg md:text-xl italic
                  leading-relaxed mb-8
                ">
                  “{t.text}”
                </blockquote>

                {/* author */}
                <footer>
                  <p className="text-[#b28c34] font-serif text-xl">
                    {t.name}
                  </p>
                  <p className="text-[#e7e1cf]/60 text-sm">
                    {t.location} • Purchased {t.product}
                  </p>
                </footer>
              </motion.div>
            </AnimatePresence>

            {/* arrows */}
            <button
              aria-label="Previous testimonial"
              onClick={() => {
                setAutoPlay(false);
                setIndex(index === 0 ? testimonials.length - 1 : index - 1);
              }}
              className="
                absolute left-4 top-1/2 -translate-y-1/2
                w-11 h-11 rounded-full
                bg-[#fcfbf8]/10 border border-[#b28c34]/30
                flex items-center justify-center
                hover:bg-[#b28c34] hover:text-[#1b180d]
                transition
              "
            >
              <ChevronLeft />
            </button>

            <button
              aria-label="Next testimonial"
              onClick={() => {
                setAutoPlay(false);
                setIndex((index + 1) % testimonials.length);
              }}
              className="
                absolute right-4 top-1/2 -translate-y-1/2
                w-11 h-11 rounded-full
                bg-[#fcfbf8]/10 border border-[#b28c34]/30
                flex items-center justify-center
                hover:bg-[#b28c34] hover:text-[#1b180d]
                transition
              "
            >
              <ChevronRight />
            </button>
          </div>

          {/* dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => {
                  setAutoPlay(false);
                  setIndex(i);
                }}
                className={`
                  h-2 rounded-full transition-all
                  ${i === index
                    ? "w-8 bg-[#b28c34]"
                    : "w-2 bg-[#e7e1cf]/30"}
                `}
              />
            ))}
          </div>
        </div>

        {/* ---------- STATS ---------- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-10 text-center">
          {[
            ["500+", "Happy Customers"],
            ["4.9", "Average Rating"],
            ["98%", "Would Recommend"],
            ["10hr", "Avg. Scent Lasting"],
          ].map(([v, l]) => (
            <div key={l}>
              <p className="text-3xl md:text-4xl font-serif text-[#b28c34]">
                {v}
              </p>
              <p className="text-[#e7e1cf]/60 text-sm mt-1">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
