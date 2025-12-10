"use client";

import { Leaf, Sparkles, Star } from "lucide-react";
import { Cormorant_Garamond } from 'next/font/google';

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})

const features = [
  {
    icon: Leaf,
    title: "NATURE INSPIRED",
    description: "Botanical blends crafted from earth's finest notes.",
  },
  {
    icon: Sparkles,
    title: "NO HARSH ADDITIVES",
    description: "Free from sulfates, parabens, and synthetics.",
  },
  {
    icon: Star,
    title: "GLOW WITH GRACE",
    description: "Fragrance that speaks softly but lingers boldly.",
  },
];

export default function RavenBadge() {
  return (
    <section
      // Lovable background: --background: 40 30% 97%;
      className="py-5 sm:py-5 md:py-16 lg:py-13 bg-[hsl(40_30%_97%)]"
    >
      <div className=" mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 md:gap-8 lg:gap-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className="flex flex-col items-center text-center group p-4 sm:p-5 md:p-6"
              >
                {/* Icon with dashed border */}
                <div className="relative mb-4 sm:mb-5 md:mb-6">
                  <div
                    // border-gold/40 → hsl(32 65% 45% / 0.4)
                    className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full border-2 border-dashed border-[hsl(32_65%_45%/_0.4)] flex items-center justify-center group-hover:border-[hsl(32_65%_45%)] transition-colors duration-300"
                  >
                    <Icon
                      // text-gold → hsl(32 65% 45%)
                      className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-[hsl(32_65%_45%)]"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>

                {/* Title */}
                <h3
                  // text-foreground → hsl(30 15% 15%)
                  className="cormorantGaramond.className text-base sm:text-lg md:text-xl font-semibold mb-2 text-[hsl(30_15%_15%)] uppercase tracking-[0.18em]"
                >
                  {feature.title}
                </h3>

                {/* Description */}
                <p
                  // text-muted-foreground → hsl(30 10% 45%)
                  className="outfit.className text-[hsl(30_10%_45%)] text-xs sm:text-sm leading-relaxed max-w-[220px] sm:max-w-none"
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
