"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export default function ExpandableContent({ sections }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggle = (i) => {
    setExpandedIndex(expandedIndex === i ? null : i);
  };

  return (
    <section className="py-24 lg:py-32 bg-(--theme-soft) transition-colors">
      <div className="max-w-4xl mx-auto px-6">

        <h2
          className="
            font-[Crimson_Text]
            text-4xl sm:text-5xl
            font-light
            text-center
            mb-16
            text-(--theme-text)
          "
        >
          Deeper Exploration
        </h2>

        <div className="space-y-6">
          {sections.map((section, index) => {
            const open = expandedIndex === index;

            return (
              <div
                key={index}
                className="border border-(--theme-border) transition-colors"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between px-6 py-6 text-left"
                >
                  <h3
                    className="
                      font-[Crimson_Text]
                      text-2xl sm:text-3xl
                      font-light
                      text-(--theme-text)
                    "
                  >
                    {section.title}
                  </h3>

                  {open ? (
                    <Minus className="w-5 h-5 text-(--theme-muted)" />
                  ) : (
                    <Plus className="w-5 h-5 text-(--theme-muted)" />
                  )}
                </button>

                {open && (
                  <div className="px-6 pb-6">
                    <p
                      className="
                        font-[system-ui]
                        text-base sm:text-lg
                        leading-relaxed
                        text-(--theme-muted)
                        max-w-[auto]
                      "
                    >
                      {section.content}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
