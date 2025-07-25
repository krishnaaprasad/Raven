'use client'
import { motion } from 'framer-motion'
import { FaFeather } from 'react-icons/fa6' // Premium feather icon for editorial accent

// Animation variants for entrance effect
const container = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.2, duration: 1, ease: 'easeOut' }
  }
}

const fade = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' } }
}

export default function AboutRaven() {
  return (
    <section
      className="
        relative w-full py-24 md:py-32 px-4 flex justify-center items-center overflow-hidden
        bg-[#181510]
        bg-[url('/aboutbg.jpg')] bg-center bg-cover bg-no-repeat
        before:absolute before:inset-0 before:bg-black/80 before:z-0 shadow-[0_12px_48px_0_rgba(246,200,104,0.12)
      "
      aria-labelledby="about-raven"
    >
      {/* Gold halo and glow for luxury effect */}
      <div
        className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 w-[520px] h-[320px] bg-[radial-gradient(ellipse_at_center,_rgba(246,200,104,0.13)_0%,_rgba(24,17,17,0.96)_95%)] pointer-events-none blur-[60px] z-0"
        aria-hidden="true"
      />
      {/* Outer vignette for luxury depth */}
      <div
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(24,21,16,0)_60%,rgba(20,17,15,0.93)_100%)] z-0"
        aria-hidden="true"
      />

      {/* Animated content */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.5 }}
        className="relative z-10 max-w-3xl mx-auto flex flex-col items-center"
      >
        {/* Icon accent for editorial touch */}
        <motion.span
          variants={fade}
          className="mb-4 drop-shadow-xl"
        >
          <FaFeather size={40} className="text-[#FFE186]" aria-hidden="true" />
        </motion.span>

        {/* Main Heading */}
        <motion.h2
          variants={fade}
          id="about-raven"
          className="text-3xl sm:text-4xl font-extrabold font-serif text-[#FFE186] uppercase tracking-wide mb-4 text-center"
        >
          RAVEN <><br/></>
          Who Is Rebel?
        </motion.h2>

        {/* Underline accent */}
        <motion.span
          variants={fade}
          className="block mx-auto w-20 h-1 bg-gradient-to-r from-[#B4933A] via-[#FFE186] to-[#B4933A] rounded-full mb-3"
        />

        {/* Brand Philosophy Manifesto using your content */}
        <motion.p
          variants={fade}
          className="text-lg sm:text-xl text-[#DAC986] font-light leading-relaxed text-center mb-6"
        >
          Rebel radiates casual elegance—the kind that doesn’t ask for attention but commands it naturally. To be a Rebel means breaking rules while blending elegance and edge, turning every step into a statement.<br />
        </motion.p>

        {/* Signature Quote */}
        <motion.p
          variants={fade}
          className="text-base sm:text-lg text-[#B4933A] italic leading-relaxed text-center mb-6"
        >
          “To scent is not to mask, but to reveal. In a world of imitation, Raven is a return to authenticity—a quiet revolution, an invitation to the extraordinary.”
        </motion.p>

        {/* Core values in a gold-card row */}
        <motion.ul
          variants={fade}
          className="flex flex-col sm:flex-row justify-center gap-5 sm:gap-10 mb-8"
        >
          <li className="px-6 py-3 border border-[#B4933A] bg-black/40 rounded-2xl text-[#FFE186] text-sm sm:text-base font-semibold backdrop-blur-xl transition-all">
            Artisan small-batch creation
          </li>
          <li className="px-6 py-3 border border-[#B4933A] bg-black/40 rounded-2xl text-[#FFE186] text-sm sm:text-base font-semibold backdrop-blur-xl transition-all">
            Rare, transparent ingredients
          </li>
          <li className="px-6 py-3 border border-[#B4933A] bg-black/40 rounded-2xl text-[#FFE186] text-sm sm:text-base font-semibold backdrop-blur-xl transition-all">
            Philosophy-first fragrance
          </li>
        </motion.ul>

        {/* Founder signature or tactile quotation */}
        <motion.div variants={fade} className="mt-4">
          <span className="block text-xs text-[#DAC986] italic mb-1">Founded in the pursuit of truth and beauty</span>
          <span className="block text-[#FFE186] font-semibold font-serif">— The Raven Atelier</span>
        </motion.div>
      </motion.div>
    </section>
  )
}
