"use client";
import Image from "next/image";
import { useTheme } from "@/app/theme-provider";

export default function HeroSection() {
  const { theme } = useTheme();

  const desktopImage =
    theme === "dark"
      ? "/hero-desktop-dark.PNG"
      : "/hero-desktop-light.PNG";

  const mobileImage =
    theme === "dark"
      ? "/hero-mobile-dark.PNG"
      : "/hero-mobile-light.PNG";

  return (
    <section
  id="hero-section"
  className="
    bg-(--theme-bg)
    relative
    min-h-svh
    overflow-hidden
    flex
    items-center
    justify-center
    -mt-12
  "
>

      {/* Navbar readability scrim */}
<div
  className="
    pointer-events-none
    absolute top-0 left-0 right-0
    h-24
    bg-linear-to-b
    from-black/45
    to-transparent
    md:h-[110px]
  "
/>
      {/* ===================== */}
      {/* DESKTOP HERO (1920×1080 SAFE) */}
      {/* ===================== */}
      <div className="hidden md:flex w-full h-full items-center justify-center">
        <div className="relative w-full max-w-[1920px] aspect-video">
          <Image
            src={desktopImage}
            alt="Raven Fragrance"
            fill
            priority
            sizes="(min-width: 1024px) 100vw"
            className="object-contain"
          />
        </div>
      </div>

      {/* ===================== */}
      {/* MOBILE HERO */}
      {/* ===================== */}
      <div className="flex md:hidden w-full h-full items-center justify-center">
        <div className="relative w-full max-w-[420px] aspect-[9/19.5]">
          <Image
            src={mobileImage}
            alt="Raven Fragrance Mobile"
            fill
            priority
            sizes="100vw"
            className="object-contain"
          />
        </div>
      </div>
    </section>
  );
}
