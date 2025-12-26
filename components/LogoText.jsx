'use client';

import { Cinzel } from "next/font/google";
import localFont from "next/font/local";


const cinzel = Cinzel({
  subsets: ["latin"],
  display: "swap",
});

const futura = localFont({
  src: "../public/fonts/Futura.ttf", // adjust if needed
  display: "swap",
});

const sizes = {
  sm: "text-lg",
  base: "text-xl",
  lg: "text-3xl",
};

export default function LogoText({ size = "lg", className = "" }) {
  return (
    <div className={`flex items-center select-none leading-none ${className}`}>
      {/* R — Cinzel */}
      <span
        className={`${cinzel.className} ${sizes[size]} leading-none`}
        style={{
          letterSpacing: "0.30em",
          marginLeft: "-0.14em",
          transform: "translateY(-0.04em)",
          fontWeight: 560,
        }}
      >
        R
      </span>

      {/* AVEN — Futura */}
      <span
        className={`${futura.className} ${sizes[size]} font-medium leading-none`}
        style={{
          letterSpacing: "0.18em",
          marginLeft: "-0.14em",
          transform: "translateY(-0.08em)",
        }}
      >
        AVEN
      </span>
    </div>
  );
}
