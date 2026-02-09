"use client";

import { Leaf, Beaker, Sparkles } from "lucide-react";
import { Cormorant_Garamond } from 'next/font/google';

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})

const WhyChooseRaven = () => {
  const reasons = [
    {
      icon: Leaf,
      emoji: "🌿",
      title: "Rare Ingredients",
      description:
        "We distill only the rarest botanicals and natural absolutes sourced ethically, chosen for depth and uniqueness.",
    },
    {
      icon: Beaker,
      emoji: "🔬",
      title: "Artisan Craft",
      description:
        "No mass production. Small batches, hand-finished. Each bottle is a work of art shaped by time, skill, and purpose.",
    },
    {
      icon: Sparkles,
      emoji: "🌗",
      title: "Philosophy First",
      description:
        "We create not for trend, but for meaning. Raven is fragrance as a personal revelation — wear your story, not a fashion.",
    },
  ];

  return (
    <section
      id="why-choose-raven"
      className="scroll-mt-4
      py-10 sm:py-18 md:py-20 lg:py-13 
      relative overflow-hidden 
      bg-[hsl(33,47%,96%)]
      "
    >
      {/* Decorative Background Blur Balls */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[40vw] max-w-96 h-[40vw] max-h-96 bg-[hsl(32_65%_45%/0.05)] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[30vw] max-w-72 h-[30vw] max-h-72 bg-[hsl(32_65%_45%/0.05)] rounded-full blur-3xl" />
      </div>

      <div className=" mx-auto px-4 sm:px-6 relative z-10">

        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 lg:mb-16 max-w-3xl mx-auto">
          <span className="text-[hsl(32_65%_45%)] text-xs sm:text-sm uppercase tracking-[0.25em] mb-3 sm:mb-4 block outfit.className">
            The Raven Difference
          </span>

          <h2 className="cormorantGaramond.className text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-[hsl(30_15%_15%)] mb-4 sm:mb-6">
            Why Choose Raven?
          </h2>

          <p className="text-[hsl(30_10%_45%)] outfit.className text-sm sm:text-base md:text-lg leading-relaxed px-4 sm:px-0">
            Raven stands alone in a world of fleeting trends. Every note, every bottle,
            is an act of craft — a journey toward truth and a fragrance meant to reveal, not mask.
          </p>
        </div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 md:gap-6 lg:gap-8">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="
                group text-center p-6 sm:p-5 md:p-6 lg:p-8 
                rounded-2xl 
                border 
                border-[hsl(35_20%_82%/0.3)]
                bg-[hsl(40_25%_95%/0.5)] 
                hover:bg-[hsl(40_25%_95%)] 
                hover:border-[hsl(32_65%_45%/0.3)]
                transition-all duration-500
              "
            >
              {/* Emoji / Icon */}
              <div className="mb-5 flex justify-center">
                <div
                  className="
                    flex items-center justify-center
                    w-28 h-28            /* ✅ BIG on mobile */
                    sm:w-14 sm:h-14     /* slightly smaller on sm+ */
                    md:w-16 md:h-16
                    rounded-full
                    bg-white/70
                    border border-[hsl(35_20%_82%/0.4)]
                    shadow-sm
                  "
                >
                  <span className="text-3xl sm:text-3xl md:text-4xl leading-none">
                    {reason.emoji}
                  </span>
                </div>
              </div>


              {/* Title */}
              <h3
                className="
                  cormorantGaramond.className
                  text-lg sm:text-xl md:text-2xl font-semibold 
                  mb-2 sm:mb-3 
                  text-[hsl(30_15%_15%)] 
                  group-hover:text-[hsl(32_65%_45%)] 
                  transition-colors duration-300
                "
              >
                {reason.title}
              </h3>

              {/* Description */}
              <p className="text-[hsl(30_10%_45%)] outfit.className text-sm md:text-base leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseRaven;