"use client";

import {
  FlaskConical,
  ShieldCheck,
  Sparkles,
  BadgeCheck,
} from "lucide-react";

const ICONS = {
  "Small-Batch Craft": FlaskConical,
  "Transparent Ingredients": ShieldCheck,
  "High Concentration": Sparkles,
  "Ethical Sourcing": BadgeCheck,
};

export default function CraftCredentials({ credentials = [] }) {
  if (!credentials.length) return null;

  return (
    <section className="py-24 lg:py-32 bg-[var(--theme-soft)] relative overflow-hidden">
      {/* depth layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--theme-soft)]/40 to-transparent pointer-events-none" />

      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Heading */}
        <div className="text-center mb-20">
          <h2 className="font-[Crimson_Text] text-4xl lg:text-5xl tracking-tight text-[var(--theme-text)] mb-6">
            Craft Transparency
          </h2>
          <p className="max-w-3xl mx-auto text-base lg:text-lg leading-relaxed text-[var(--theme-muted)] font-[Manrope,sans-serif]">
            Every bottle represents our commitment to formulation integrity and
            small-batch excellence.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {credentials.map((item, index) => {
            const Icon = ICONS[item.title] || Sparkles;

            return (
              <div
                key={item.id || `${item.title}-${index}`}
                className="
                  text-center
                  px-8 py-10
                  bg-[var(--theme-bg)]
                  border border-[var(--theme-border)]
                "
              >
                {/* Icon */}
                <div className="
                  mx-auto mb-8
                  w-17 h-17
                  flex items-center justify-center
                  bg-[var(--theme-bg)]
                  border border-[var(--theme-border)]
                  text-[var(--theme-text)]
                ">
                  <Icon size={32} strokeWidth={1.25} />
                </div>

                {/* Title */}
                <h3 className="
                  text-xs
                  tracking-[0.25em]
                  uppercase
                  mb-4
                  font-semibold
                  text-[var(--theme-text)]
                ">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="
                  text-[14px]
                  leading-normal
                  text-[var(--theme-muted)]
                  font-[Manrope,sans-serif]
                ">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
