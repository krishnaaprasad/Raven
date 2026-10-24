"use client";

import { motion, AnimatePresence } from "framer-motion";
import { getImageProps } from "next/image";
import { useTheme } from "@/app/theme-provider";

const HERO = {
  light: { desktop: "/hero-desktop-light.PNG", mobile: "/hero-mobile-light.PNG" },
  dark: { desktop: "/hero-desktop-dark.PNG", mobile: "/hero-mobile-dark.PNG" },
};

// Art-directed hero: the browser downloads only the image for its own breakpoint
// (previously both desktop and mobile heroes were fetched on every device).
function HeroPicture({ theme }) {
  const set = HERO[theme === "dark" ? "dark" : "light"];
  const common = { alt: "Raven Fragrance Collection", fill: true, sizes: "100vw", quality: 75, priority: true };

  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: set.desktop });
  const {
    props: { srcSet: mobileSrcSet, ...rest },
  } = getImageProps({ ...common, src: set.mobile });

  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={desktopSrcSet} sizes="100vw" />
      <source media="(max-width: 767px)" srcSet={mobileSrcSet} sizes="100vw" />
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img {...rest} className="object-cover object-center" />
    </picture>
  );
}

export default function HeroSection() {
  const { theme } = useTheme();

  return (
    <section className="bg-(--theme-bg) relative min-h-svh overflow-hidden flex items-center justify-center -mt-12">
      <div className="absolute inset-0">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={`hero-${theme}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full h-full absolute inset-0"
          >
            <HeroPicture theme={theme} />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
