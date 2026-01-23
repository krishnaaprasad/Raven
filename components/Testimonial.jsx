'use client';

import { useEffect, useRef } from "react";
import { Crimson_Text } from "next/font/google";

const crimson = Crimson_Text({
  subsets: ["latin"],
  weight: ["400"],
});

const testimonials = [
  {
    id: 1,
    name: "Nikita Pol",
    location: "Sangli",
    product: "REBEL",
    text: "The most luxurious fragrance I've ever owned. The scent lasts all day and I receive compliments everywhere I go. Truly worth every rupee!",
  },
  {
    id: 2,
    name: "Arindam Mahapatra",
    location: "Mumbai",
    product: "REBEL",
    text: "Bold, sophisticated, and uniquely captivating. This perfume has become my signature scent. The quality is exceptional for the price.",
  },
  {
    id: 3,
    name: "Asmita Khade",
    location: "Sangli",
    product: "REBEL",
    text: "I was hesitant to buy perfume online, but Raven exceeded all expectations. The packaging was beautiful and the fragrance is absolutely divine.",
  },
  {
    id: 4,
    name: "Anand Pandey",
    location: "Delhi",
    product: "REBEL",
    text: "Finally found a brand that understands what premium fragrance should be. The longevity is incredible — I can still smell it after 8 hours!",
  },
];

export default function TestimonialsMarquee() {
  const trackRef = useRef(null);

  const pos = useRef(0);
  const velocity = useRef(0);
  const isDragging = useRef(false);
  const lastX = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const speed = 0.5;
    const friction = 0.4;

    const animate = () => {
      if (!isDragging.current) {
        velocity.current -= speed;
      }

      pos.current += velocity.current;
      velocity.current *= friction;

      if (Math.abs(pos.current) >= track.scrollWidth / 2) {
        pos.current = 0;
      }

      track.style.transform = `translateX(${pos.current}px)`;
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, []);

  const startDrag = (x) => {
    isDragging.current = true;
    lastX.current = x;
  };

  const onDrag = (x) => {
    if (!isDragging.current) return;
    const delta = x - lastX.current;
    velocity.current = delta;
    pos.current += delta;
    lastX.current = x;
  };

  const endDrag = () => {
    isDragging.current = false;
  };

  return (
    <section className="relative py-12 md:py-20 bg-(--theme-bg) overflow-hidden transition-colors duration-500">

      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 text-center mb-12">
        <h2 className={`${crimson.className} text-[36px] sm:text-[60px] font-light text-(--theme-text) mb-3`}>
          Voices of Intention
        </h2>
        <p className="font-[system-ui] text-(--theme-muted) text-[16px] sm:text-[20px]">
          From those who understand that presence speaks louder than performance.
        </p>
      </div>

      {/* Marquee */}
      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-8 px-4 will-change-transform cursor-grab active:cursor-grabbing select-none touch-pan-y"
          onMouseDown={(e) => startDrag(e.clientX)}
          onMouseMove={(e) => onDrag(e.clientX)}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onTouchStart={(e) => startDrag(e.touches[0].clientX)}
          onTouchMove={(e) => onDrag(e.touches[0].clientX)}
          onTouchEnd={endDrag}
        >
          {[...testimonials, ...testimonials].map((t, i) => (
            <div
              key={i}
              className="
                min-w-[260px] sm:min-w-[320px] lg:min-w-[380px]
                border border-(--theme-border)
                bg-(--theme-soft)
                p-5 sm:p-6 lg:p-8
                transition-colors duration-500
              "
            >
              <p className="font-[system-ui] italic text-(--theme-text) text-[15px] sm:text-[17px] lg:text-[18px] leading-relaxed mb-5">
                “{t.text}”
              </p>

              <div className="h-px w-12 bg-(--theme-border) mb-5" />

              <p className="font-[system-ui] text-[13px] sm:text-sm tracking-wide text-(--theme-muted) font-medium">
                {t.name}
              </p>

              <p className="font-[system-ui] text-[13px] sm:text-sm text-(--theme-muted) mt-1">
                Purchased: {t.product}
              </p>

              <p className="font-[system-ui] text-[13px] sm:text-sm text-(--theme-muted) mt-1">
                {t.location}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
