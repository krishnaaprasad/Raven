'use client'
import { motion } from 'framer-motion'
import React from 'react'

// Animation variants for entrance effects
const container = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1, y: 0,
    transition: { staggerChildren: 0.2, duration: 1, ease: 'easeOut' }
  }
}
const fade = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' } }
}

export default function WhyChooseRaven() {
  return (
    <section className="
    relative w-full py-24 md:py-32 px-4 flex justify-center items-center overflow-hidden bg-[#181510]
    bg-[url('/choosebg.png')] bg-center bg-cover bg-no-repeat 
    before:absolute before:inset-0 before:bg-black/85 before:z-0
  "
  aria-labelledby="about-raven"
     >

      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          className="flex flex-col items-center text-center"
        >
          <motion.h2
            variants={fade}
            className="text-3xl sm:text-4xl font-serif font-bold text-[#FFE186] mb-4 tracking-wide"
          >
            Why Choose Raven?
          </motion.h2>
          <motion.div
            variants={fade}
            className="mx-auto w-20 h-1 rounded-full bg-gradient-to-r from-[#B4933A] via-[#FFE186] to-[#B4933A] mb-7"
          />

          <motion.p
            variants={fade}
            className="text-lg sm:text-xl text-[#DAC986] font-light max-w-2xl mx-auto mb-14"
          >
            Raven stands alone in a world of fleeting trends. Every note, every bottle, is an act of craft, a journey toward truth—and a fragrance meant to reveal, not mask.
          </motion.p>

          {/* Differentiators grid */}
          <motion.div
            variants={container}
            className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-9 max-w-4xl mx-auto"
          >
            <motion.div
              variants={fade}
              className="bg-black/40 border border-[#B4933A] rounded-2xl p-7 flex flex-col items-center text-center shadow-xl backdrop-blur-xl transition-all"
            >
              <span className="text-3xl text-[#FFE186] mb-3">🌿</span>
              <h3 className="text-lg font-semibold text-[#FFE186] mb-2">Rare Ingredients</h3>
              <p className="text-[#DAC986] text-base font-light">
                We distill only the rarest botanicals and natural absolutes—sourced ethically, chosen for depth and uniqueness.
              </p>
            </motion.div>
            <motion.div
              variants={fade}
              className="bg-black/40 border border-[#B4933A] rounded-2xl p-7 flex flex-col items-center text-center shadow-xl backdrop-blur-xl transition-all"
            >
              <span className="text-3xl text-[#FFE186] mb-3">🔬</span>
              <h3 className="text-lg font-semibold text-[#FFE186] mb-2">Artisan Craft</h3>
              <p className="text-[#DAC986] text-base font-light">
                No mass production. Small batches, hand-finished. Each bottle is a work of art shaped by time, skill, and purpose.
              </p>
            </motion.div>
            <motion.div
              variants={fade}
              className="bg-black/40 border border-[#B4933A] rounded-2xl p-7 flex flex-col items-center text-center shadow-xl backdrop-blur-xl transition-all"
            >
              <span className="text-3xl text-[#FFE186] mb-3">🌗</span>
              <h3 className="text-lg font-semibold text-[#FFE186] mb-2">Philosophy First</h3>
              <p className="text-[#DAC986] text-base font-light">
                We create not for trend, but for meaning. Raven is fragrance as a personal revelation and philosophy—wear your story, not a fashion.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
