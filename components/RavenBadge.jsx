'use client';
import { Leaf, Flower, DropHalfBottom, Sparkle } from 'phosphor-react';

const features = [
  {
    Icon: Leaf,
    title: 'Nature Inspired',
    description: 'Botanical blends crafted from earth’s finest notes.',
  },
  {
    Icon: Flower,
    title: 'No Harsh Additives',
    description: 'Free from sulfates, parabens, and synthetics.',
  },
  {
    Icon: DropHalfBottom,
    title: 'Water-Based Scents',
    description: 'Lightweight formulas for long-lasting wear.',
  },
  {
    Icon: Sparkle,
    title: 'Glow with Grace',
    description: 'Fragrance that speaks softly but lingers boldly.',
  },
];

export default function RavenBadge() {
  return (
    <section className="w-full py-20 bg-white px-4">
      <div className="max-w-6xl mx-auto text-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {features.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center transition-all hover:scale-105 duration-300"
            >
              <div className="w-20 h-20 border-2 border-dashed border-[#B28C34] rounded-full flex items-center justify-center mb-4 text-[#B28C34] bg-white shadow-[0_2px_16px_rgba(178,140,52,0.1)]">
                <item.Icon size={36} weight="duotone" />
              </div>
              <h3 className="text-md font-semibold text-[#3F3F3F] uppercase mb-1">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
