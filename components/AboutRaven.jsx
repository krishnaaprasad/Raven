'use client'
import { motion } from 'framer-motion'
import { FaFeather } from 'react-icons/fa6'

const container = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.18, duration: 0.85, ease: 'easeOut' }
  }
}
const fade = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
}

export default function AboutRaven() {
  return (
    <section
      className="
        relative w-full py-24 md:py-32 px-4 flex justify-center items-center overflow-hidden
        bg-[#FDF6EC]
        border-4 border-[#B28C34]/20 shadow-[0_6px_32px_0_rgba(178,140,52,0.11)] rounded-[2.5rem]
      "
      aria-labelledby="about-raven"
    >
      {/* Soft subtle gold radial for depth */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[180px] bg-[radial-gradient(ellipse_at_center,_rgba(201,174,113,0.10)_0%,_rgba(253,246,236,0.96)_100%)] rounded-3xl blur-[38px] z-0 pointer-events-none"
        aria-hidden="true"
      />
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.5 }}
        className="relative z-10 max-w-3xl w-full mx-auto flex flex-col items-center"
      >
        {/* Editorial feather accent */}
        <motion.span variants={fade} className="mb-4">
          <FaFeather size={40} className="text-[#B28C34] drop-shadow-[0_1px_6px_rgba(110,82,28,0.16)]" aria-hidden="true" />
        </motion.span>
        <motion.h2
          variants={fade}
          id="about-raven"
          className="text-3xl sm:text-4xl font-extrabold font-serif text-[#B28C34] drop-shadow-[0_1px_4px_rgba(80,68,42,0.13)] uppercase tracking-wider mb-4 text-center"
        >
          RAVEN <><br /></>Who Is Rebel?
        </motion.h2>
        {/* Gold underline with glow */}
        <div className="relative w-20 h-1 mx-auto mb-7">
          <div className="w-full h-full rounded-full bg-gradient-to-r from-[#B28C34]/95 via-[#F9E8A7]/90 to-[#B28C34]/80" />
          <div
            className="absolute left-1/2 top-full -translate-x-1/2 mt-1 w-36 h-6 bg-[radial-gradient(ellipse_at_center,_rgba(178,140,52,0.13)_0%,_rgba(249,232,167,0.03)_80%,transparent_100%)] pointer-events-none"
            style={{ filter: 'blur(7px)' }}
            aria-hidden="true"
          />
        </div>
        {/* Brand philosophy */}
        <motion.p
          variants={fade}
          className="text-lg sm:text-xl text-neutral-800 font-light leading-relaxed text-center mb-6"
        >
          <span className="text-[#B28C34] font-semibold">Rebel</span> radiates casual elegance—the kind that doesn’t ask for attention but commands it naturally. To be a <span className="text-[#B28C34] font-semibold">Rebel</span> means breaking rules while blending elegance and edge, turning every step into a statement.
        </motion.p>
        {/* Signature quote */}
        <motion.p
          variants={fade}
          className="text-base sm:text-lg text-[#B28C34] italic drop-shadow-[0_1px_3px_rgba(110,82,28,0.14)] leading-relaxed text-center mb-7"
        >
          “To scent is not to mask, but to reveal. In a world of imitation, <span className="font-semibold">Raven</span> is a return to authenticity—a quiet revolution, an invitation to the extraordinary.”
        </motion.p>
        {/* Core values */}
        <motion.ul
          variants={fade}
          className="flex flex-col sm:flex-row justify-center gap-5 sm:gap-10 mb-8"
        >
          {[
            'Artisan small-batch creation',
            'Rare, transparent ingredients',
            'Philosophy-first fragrance'
          ].map((text, i) => (
            <li key={i}
              className="px-7 py-3 border border-[#B28C34] bg-white/95 rounded-2xl text-[#B28C34] text-sm sm:text-base font-semibold shadow-sm backdrop-blur-md transition-all"
            >
              {text}
            </li>
          ))}
        </motion.ul>
        {/* Founder signature */}
        <motion.div variants={fade} className="mt-4">
          <span className="block text-xs text-[#846525] italic mb-1">Founded in the pursuit of truth and beauty</span>
          <span className="block text-[#B28C34] font-semibold font-serif">— The Raven Atelier</span>
        </motion.div>
      </motion.div>
    </section>
  )
}
