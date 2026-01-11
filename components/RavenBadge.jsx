"use client";

import { useState } from "react";

const badges = [
  { title: "EDP", subtitle: "Eau De Parfum", icon: droplet() },
  { title: "High Quality", subtitle: "Fragrance", icon: award() },
  { title: "Small Batch", subtitle: "Crafted", icon: batch() },
  { title: "Secure", subtitle: "Payment", icon: lock() },
  { title: "Cruelty Free", subtitle: "Ethical Choice", icon: heart() },
  { title: "No Harsh", subtitle: "Additives", icon: ban() },
  { title: "Trusted", subtitle: "Delivery", icon: truck() },
];

export default function TrustBadges() {
  const [paused, setPaused] = useState(false);

  return (
    <section
      className="relative bg-white py-10 sm:py-12 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-linear-to-r from-white to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-linear-to-l from-white to-transparent z-10" />

      {/* Slider viewport */}
      <div className="overflow-hidden">
        <div
          className="flex w-max"
          style={{
            animation: `marquee 35s linear infinite`,
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          {[...badges, ...badges].map((b, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center mx-6 sm:mx-10 min-w-[120px] sm:min-w-40"
            >
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border border-[#eee] flex items-center justify-center text-[#111] mb-3 sm:mb-5 hover:bg-[#fafafa] transition">
                {b.icon}
              </div>

              <div className="font-serif text-[10px] sm:text-xs tracking-[0.25em] uppercase text-[#111]">
                {b.title}
              </div>
              <div className="font-serif text-[10px] sm:text-xs tracking-[0.25em] uppercase text-[#666]">
                {b.subtitle}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Local keyframes (guaranteed to work) */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}

/* ---------- ICONS ---------- */

function droplet() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M12 2 C12 2 6 10 6 14a6 6 0 0 0 12 0C18 10 12 2 12 2Z" />
    </svg>
  );
}

function award() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="12" cy="8" r="5" />
      <path d="M8 13l-2 9 6-4 6 4-2-9" />
    </svg>
  );
}

function batch() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </svg>
  );
}

function lock() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" />
    </svg>
  );
}

function heart() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10Z" />
    </svg>
  );
}

function ban() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="12" cy="12" r="8" />
      <path d="M5 5l14 14" />
    </svg>
  );
}

function truck() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="2" y="7" width="13" height="8" rx="1" />
      <path d="M15 10h4l3 3v2h-7" />
      <circle cx="7" cy="18" r="1" />
      <circle cx="17" cy="18" r="1" />
    </svg>
  );
}
