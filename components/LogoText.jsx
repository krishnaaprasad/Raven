'use client';

import { Cinzel } from "next/font/google";
import localFont from "next/font/local";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["600", "600"],
  display: "swap",
});

const futura = localFont({
  src: "../public/fonts/Futura.ttf", // adjust if needed
  display: "swap",
});

const sizes = {
  sm: "text-lg",
  base: "text-xl",
  lg: "text-2xl",
};

export default function LogoText({ size = "base" }) {
  return (
    <div className="flex items-center select-none leading-none">
      {/* R — Cinzel (fatter) */}
      <span
        className={`${cinzel.className} ${sizes[size]} font-medium text-[#1b180d] leading-none`}
        style={{ letterSpacing: "0.30em",marginLeft: "-0.14em",transform: "translateY(-0.04em)", }}
      >
        R
      </span>

      {/* AVEN — Futura (nudged up & tight) */}
      <span
        className={`${futura.className} ${sizes[size]} font-medium text-[#1b180d] leading-none`}
        style={{
          letterSpacing: "0.18em",
          marginLeft: "-0.14em",      // remove gap between R and A
          transform: "translateY(-0.08em)", // ⬆️ lift AVEN to match R height
        }}
      >
        AVEN
      </span>
    </div>
  );
}
