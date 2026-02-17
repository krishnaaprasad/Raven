"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export default function TrustBadges() {
  const trackRef = useRef(null);

  const pos = useRef(0);
  const velocity = useRef(0);
  const isDragging = useRef(false);
  const lastX = useRef(0);

  const badges = [
    { title: "Cruelty Free", image: "/badges/cruelty-free.png" },
    { title: "High Quality Fragrance", image: "/badges/high-quality-fragrance.png" },
    { title: "Small Batch Crafted", image: "/badges/small-batch-crafted.png" },
    { title: "Secure Payment", image: "/badges/secure-payment.png" },
    { title: "Trusted Delivery", image: "/badges/trusted-delivery.png" },
    { title: "No Harsh Additives", image: "/badges/No-harsh-additives.png" },
  ];

  /* ---------------- AUTO + MOMENTUM ---------------- */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const speed = 0.5;     // auto scroll speed
    const friction = 0.4; // smooth momentum

    const animate = () => {
      if (!isDragging.current) {
        velocity.current -= speed;
      }

      pos.current += velocity.current;
      velocity.current *= friction;

      // infinite loop reset
      if (Math.abs(pos.current) >= track.scrollWidth / 2) {
        pos.current = 0;
      }

      track.style.transform = `translateX(${pos.current}px)`;
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, []);

  /* ---------------- DRAG HANDLERS ---------------- */
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
    <section className="relative bg-(--theme-bg) border-y border-(--theme-border) py-5 sm:py-7 overflow-hidden transition-colors duration-500">

      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className="
            flex gap-8 sm:gap-12 px-4
            will-change-transform
            cursor-grab active:cursor-grabbing
            select-none
            touch-pan-y
          "
          onMouseDown={(e) => startDrag(e.clientX)}
          onMouseMove={(e) => onDrag(e.clientX)}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onTouchStart={(e) => startDrag(e.touches[0].clientX)}
          onTouchMove={(e) => onDrag(e.touches[0].clientX)}
          onTouchEnd={endDrag}
        >
          {[...badges, ...badges].map((badge, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center min-w-[140px] sm:min-w-[200px]"
            >
              {/* Circle Badge */}
              <div className="relative w-18 h-18 sm:w-26 sm:h-26 rounded-full overflow-hidden border border-(--theme-border)">
                <Image
                  src={badge.image}
                  alt={badge.title}
                  fill
                  className="object-cover"
                />
              </div>

              <h4 className="mt-2 font-[Crimson_Text] text-xs sm:text-base tracking-wide text-(--theme-text)">
                {badge.title}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
