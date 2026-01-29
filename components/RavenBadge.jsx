"use client";

import { useState } from "react";

export default function TrustBadges() {
  const [paused, setPaused] = useState(false);

  const badges = [
    { title: "EDP", subtitle: "Eau De Parfum", icon: Droplet },
    { title: "High Quality", subtitle: "Fragrance", icon: Award },
    { title: "Small Batch", subtitle: "Crafted", icon: Batch },
    { title: "Secure", subtitle: "Payment", icon: Lock },
    { title: "Cruelty Free", subtitle: "Ethical Choice", icon: Heart },
    { title: "No Harsh", subtitle: "Additives", icon: Ban },
    { title: "Trusted", subtitle: "Delivery", icon: Truck },
  ];

  return (
    <section
      className="
        relative
        bg-(--theme-soft)
        border-y border-(--theme-border)
        py-10 sm:py-12
        overflow-hidden
        transition-colors duration-500
      "
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
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
              <div
                className="
                  w-10 h-10 sm:w-14 sm:h-14
                  rounded-full
                  border border-(--theme-border)
                  flex items-center justify-center
                  text-(--theme-text)
                  mb-3 sm:mb-5
                  bg-(--theme-bg)
                  hover:bg-(--theme-soft)
                  transition-colors duration-300
                "
              >
                <b.icon />
              </div>

              <div className="font-[Crimson_Text] text-[10px] sm:text-xs tracking-[0.25em] uppercase text-(--theme-text)">
                {b.title}
              </div>

              <div className="font-[system-ui] text-[10px] sm:text-xs tracking-[0.2em] uppercase text-(--theme-muted)">
                {b.subtitle}
              </div>
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


/* ---------- ICONS ---------- */

function Droplet() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M12 2 C12 2 6 10 6 14a6 6 0 0 0 12 0C18 10 12 2 12 2Z" />
    </svg>
  );
}

function Award() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="12" cy="8" r="5" />
      <path d="M8 13l-2 9 6-4 6 4-2-9" />
    </svg>
  );
}

function Batch() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </svg>
  );
}

function Lock() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" />
    </svg>
  );
}

function Heart() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10Z" />
    </svg>
  );
}

function Ban() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="12" cy="12" r="8" />
      <path d="M5 5l14 14" />
    </svg>
  );
}

function Truck() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="2" y="7" width="13" height="8" rx="1" />
      <path d="M15 10h4l3 3v2h-7" />
      <circle cx="7" cy="18" r="1" />
      <circle cx="17" cy="18" r="1" />
    </svg>
  );
}
