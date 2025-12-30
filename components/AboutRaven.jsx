'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'


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
        shadow-[0_6px_32px_0_rgba(178,140,52,0.11)]
      "
      aria-labelledby="about-raven"
    >
      {/* Soft subtle gold radial for depth */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[180px] bg-[radial-gradient(ellipse_at_center,rgba(201,174,113,0.10)_0%,rgba(253,246,236,0.96)_100%)] rounded-3xl blur-[38px] z-0 pointer-events-none"
        aria-hidden="true"
      />
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.5 }}
        className="relative z-10 max-w-3xl w-full mx-auto flex flex-col items-center"
      >        
        {/* Logo next to text */}
        <motion.div variants={fade} className="flex items-center justify-center gap-3 mb-2">
        <span className="text-3xl sm:text-4xl font-extrabold font-serif text-[#B28C34] drop-shadow-[0_1px_4px_rgba(80,68,42,0.13)] uppercase tracking-wider">
            RAVEN
        </span>
        <Image
            src="/fevicon.PNG"
            alt="Raven Logo"
            width={40}
            height={40}
            className="drop-shadow-[0_1px_6px_rgba(110,82,28,0.16)]"
            priority
        />
        
        </motion.div>

        <motion.h2
          variants={fade}
          id="about-raven"
          className="text-2xl sm:text-3xl font-extrabold font-serif text-[#B28C34] uppercase tracking-wider mb-4 text-center"
        >
          Who Is Rebel?
        </motion.h2>
        {/* Gold underline with glow */}
        <div className="relative w-20 h-1 mx-auto mb-7">
          <div className="w-full h-full rounded-full bg-linear-to-r from-[#B28C34]/95 via-[#F9E8A7]/90 to-[#B28C34]/80" />
          <div
            className="absolute left-1/2 top-full -translate-x-1/2 mt-1 w-36 h-6 bg-[radial-gradient(ellipse_at_center,rgba(178,140,52,0.13)_0%,rgba(249,232,167,0.03)_80%,transparent_100%)] pointer-events-none"
            style={{ filter: 'blur(7px)' }}
            aria-hidden="true"
          />
        </div>
        {/* Brand philosophy */}
        <motion.p
          variants={fade}
          className="text-lg sm:text-xl text-neutral-800 font-light leading-relaxed text-center mb-6"
        >
          <span className="text-[#B28C34] font-semibold">Rebel</span> embodies effortless style and confident presence—never seeking attention, but always making an impact. To be a <span className="text-[#B28C34] font-semibold">Rebel</span> means challenging expectations and blending sophistication with boldness, turning every moment into a statement.
        </motion.p>
        {/* Signature quote */}
        <motion.p
          variants={fade}
          className="text-base sm:text-lg text-[#96711a] italic leading-relaxed text-center mb-7"
        >
          “Rebel is pure expression. In a world of imitation, <span className="font-semibold">Raven</span> invites authenticity, a quiet revolution for those who dare to be extraordinary.”
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
          <span className="block text-xs text-[#846525] italic mb-1 text-center">Founded in the pursuit of truth and beauty</span>
          <span className="block text-[#B28C34] font-semibold font-serif text-center">— The Raven Atelier</span>
        </motion.div>
      </motion.div>
    </section>
  )
}
