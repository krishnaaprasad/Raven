'use client'
import { motion } from 'framer-motion'
import React from 'react'

const container = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1, y: 0,
    transition: { staggerChildren: 0.18, duration: 0.85, ease: 'easeOut' }
  }
}
const fade = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
}

export default function WhyChooseRaven() {
  return (
    <section
      className="
        relative w-full py-24 md:py-32 px-4 flex justify-center items-center overflow-hidden
        bg-[#FCF8F3]
        border-2 border-[#C9AE71]/15 shadow-[0_9px_45px_0_rgba(201,174,113,0.10)]
      "
      aria-labelledby="about-raven"
    >
      {/* Soft gold radial for gentle dimension */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[180px] bg-[radial-gradient(ellipse_at_center,_rgba(178,140,52,0.10)_0%,_rgba(252,248,243,0.94)_100%)] rounded-3xl blur-[38px] z-0 pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
          className="flex flex-col items-center text-center"
        >
          <motion.h2
            variants={fade}
            className="text-3xl sm:text-4xl font-extrabold font-serif text-[#B28C34] drop-shadow-[0_1px_4px_rgba(80,68,42,0.12)] uppercase tracking-wider mb-3 text-center"
          >
            Why Choose Raven?
          </motion.h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#EFE2BA] via-[#B28C34] to-[#EFE2BA] rounded-full mb-8" />

          <motion.p
            variants={fade}
            className="text-lg sm:text-xl text-neutral-800 font-normal max-w-2xl mx-auto mb-14"
          >
            Raven stands alone in a world of fleeting trends. Every note, every bottle, is an act of craft, a journey toward truth—and a fragrance meant to reveal, not mask.
          </motion.p>

          {/* Differentiators grid */}
          <motion.div
            variants={container}
            className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-7 max-w-4xl mx-auto"
          >
            {[{
              icon: '🌿',
              heading: 'Rare Ingredients',
              desc: 'We distill only the rarest botanicals and natural absolutes—sourced ethically, chosen for depth and uniqueness.'
            }, {
              icon: '🔬',
              heading: 'Artisan Craft',
              desc: 'No mass production. Small batches, hand-finished. Each bottle is a work of art shaped by time, skill, and purpose.'
            }, {
              icon: '🌗',
              heading: 'Philosophy First',
              desc: 'We create not for trend, but for meaning. Raven is fragrance as a personal revelation and philosophy—wear your story, not a fashion.'
            }].map((item, idx) => (
              <motion.div
                key={idx}
                variants={fade}
                className="bg-white/92 border border-[#B28C34] rounded-2xl p-7 flex flex-col items-center text-center shadow-sm backdrop-blur-md transition-all hover:shadow-md hover:border-[#B28C34]/80"
              >
                <span className="text-3xl text-[#B28C34] mb-3">{item.icon}</span>
                <h3 className="text-lg font-semibold text-[#B28C34] mb-2">{item.heading}</h3>
                <p className="text-[#7B6B4B] text-base font-normal">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
