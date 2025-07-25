'use client'
import { motion } from 'framer-motion'
import React from 'react'

// Animation variants for staggered fade-up effects
const container = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.25,
      ease: 'easeOut',
    },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' } },
}

// Glow pulse for bottle border
const pulseGlow = {
  animate: {
    boxShadow: [
      '0 0 10px rgba(255,215,0,0.3)',
      '0 0 30px rgba(255,215,0,0.7)',
      '0 0 10px rgba(255,215,0,0.3)',
    ],
  },
  transition: {
    duration: 3,
    repeat: Infinity,
    repeatType: 'loop',
  },
}

// Floating animation for background dots (optional)
const floating = {
  animate: {
    y: [0, -20, 0],
    x: [0, 10, 0],
  },
  transition: {
    duration: 6,
    repeat: Infinity,
    repeatType: 'loop',
    ease: 'easeInOut',
  },
}

// Sparkle effect for text highlight
const sparkleKeyframes = {
  animate: {
    opacity: [0, 1, 0],
    scale: [0.8, 1.1, 0.8],
    rotate: [0, 15, 0],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    repeatDelay: 4,
    ease: 'easeInOut',
  },
}

export default function ProductBanner() {
  return (
    <section className="relative w-full min-h-[350px] md:min-h-[500px] overflow-hidden bg-[#3b2a0c]">
      {/* Central gold-blur halo behind bottle */}
      <div className="absolute left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2 w-[440px] h-[260px] sm:w-[560px] sm:h-[340px] bg-[radial-gradient(ellipse_at_center,_rgba(246,190,67,0.30)_0%,_rgba(24,17,17,0.90)_80%)] rounded-full blur-[50px] z-0" />
      {/* Subtle vignette for luxury depth */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(24,17,17,0)_60%,rgba(18,15,12,0.92)_98%)] z-0" />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-14 py-28 px-6 sm:px-12">
        {/* Bottle with 3D hover and glowing border */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          whileHover={{ scale: 1.05, rotateY: 7 }}
          whileTap={{ scale: 0.95, rotateY: 0 }}
          className="w-full md:w-1/2 flex justify-center cursor-grab will-change-transform"
        >
          <div className="relative group transition duration-500 ease-in-out">
            <img
              src="/perfume.PNG" // Use your uploaded bottle image here
              alt="Raven Fragrance Bottle"
              className="w-[320px] md:w-[380px] lg:w-[420px] shadow-[0_8px_30px_rgba(255,215,0,0.6)] rounded-3xl object-contain bg-transparent select-none"
              draggable={false}
            />
            <motion.div
              className="absolute inset-0 rounded-3xl border border-yellow-500 opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
              animate={pulseGlow.animate}
              transition={pulseGlow.transition}
            />
          </div>
        </motion.div>

        {/* Text Content with philosophical tone */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="text-center md:text-left w-full md:w-1/2 max-w-xl"
        >
          <motion.h3
            variants={fadeUp}
            className="text-xl font-light text-yellow-300 mb-3 tracking-wide hover:text-yellow-100 transition-colors relative inline-block"
          >
            Raven Fragrance
            <motion.span
              className="absolute -top-2 right-0 w-3 h-3 rounded-full bg-yellow-400 drop-shadow-lg"
              variants={sparkleKeyframes}
              aria-hidden="true"
            />
          </motion.h3>

          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-yellow-400 to-yellow-100 text-transparent bg-clip-text drop-shadow-xl hover:drop-shadow-[0_0_18px_rgba(255,215,0,0.9)] transition-shadow duration-500 mb-6"
          >
            Rebel — The Spirit Within Raven
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-0 text-lg text-zinc-300 leading-relaxed max-w-xl mx-auto md:mx-0 pointer-events-none select-none mb-8"
          >
            <em>
              “Rebel is the whisper of wildness in a civilized world.
              <br />
              There is wisdom in defiance. Crafted for the soul that dares,
              <br />
              a golden elixir awakening your unique signature.”
            </em>
          </motion.p>

          <motion.h2
            variants={fadeUp}
            className="text-3xl sm:text-4xl font-bold text-yellow-300 mb-4"
          >
            The Philosopher’s Manifesto
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mb-8 text-zinc-400 leading-relaxed max-w-xl mx-auto md:mx-0"
          >
            <q>
              To scent is not to mask, but to reveal. Raven is an enigma—
              <br />
              both armor and meditation. Luxury is awareness;
              <br />
              memory the rarest spice.
            </q>
          </motion.p>

          
        </motion.div>
      </div>
    </section>
  )
}
