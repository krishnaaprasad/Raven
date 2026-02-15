"use client";

import { useState } from "react";
import Image from "next/image";

export default function TrustBadges() {
  const [paused, setPaused] = useState(false);

  const badges = [
    {
      title: "Cruelty Free",
      image: "/badges/cruelty-free.png",
    },
    {
      title: "High Quality Fragrance",
      image: "/badges/high-quality-fragrance.png",
    },
    {
      title: "Small Batch Crafted",
      image: "/badges/small-batch-crafted.png",
    },
    {
      title: "Secure Payment",
      image: "/badges/secure-payment.png",
    },
    {
      title: "Trusted Delivery",
      image: "/badges/trusted-delivery.png",
    },
    {
      title: "No Harsh Additives",
      image: "/badges/No-harsh-additives.png",
    },
  ];

  return (
    <section
      className="relative bg-(--theme-bg) border-y border-(--theme-border) py-7 overflow-hidden transition-colors duration-500"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden">
        <div
          className="flex w-max items-center"
          style={{
            animation: `marquee 35s linear infinite`,
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          {[...badges, ...badges].map((badge, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center mx-6 min-w-[200px] group"
            >
              {/* Perfect Circular Frame */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full">
                <div className="absolute inset-0 rounded-full border border-(--theme-border) bg-(--theme-bg)" />

                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <Image
                    src={badge.image}
                    alt={badge.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Title */}
              <h4 className="mt-2 font-[Crimson_Text] text-sm sm:text-base tracking-wide text-(--theme-text)">
                {badge.title}
              </h4>

             
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
