'use client'
import { motion } from 'framer-motion'

const container = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1, y: 0,
    transition: { staggerChildren: 0.21, duration: 1.05, ease: 'easeOut' }
  }
}
const fade = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: 'easeOut' } }
}

export default function RebelFinale() {
  return (
    <section
      className="
        relative w-full py-28 px-4 flex justify-center items-center overflow-hidden
        bg-[#FCF8F3]
        border-2 border-[#C9AE71]/15 shadow-[0_9px_45px_0_rgba(201,174,113,0.10)]
      "
      aria-labelledby="rebel-finale"
    >
      {/* Gold radial and particles ... (same as before) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[220px] bg-[radial-gradient(ellipse_at_center,_rgba(201,174,113,0.13)_0%,_rgba(252,248,243,0.97)_100%)] rounded-3xl blur-[44px] z-0 pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(18)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.13 + Math.random() * 0.13, scale: 0.5 + Math.random() * 0.8, x: Math.random() * 1100 - 540, y: Math.random() * 320 - 140 }}
            animate={{
              opacity: [0.08, 0.19, 0.09],
              scale: [0.8, 1.19, 0.8],
              y: `+=${55 + Math.random()*75}`,
              transition: { duration: 7.7 + Math.random()*2, delay: Math.random()*2, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }
            }}
            className="absolute w-3 h-3 rounded-full bg-[#FFE186] blur-[8px]"
            style={{
              left: `calc(50% + ${Math.random()*540-270}px)`,
              top: `${Math.random()*480-80}px`
            }}
          />
        ))}
      </div>
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[170px] h-[55px] bg-[radial-gradient(ellipse_at_center,_rgba(255,225,134,0.13)_0%,_rgba(255,255,255,0)_97%)] blur-2xl pointer-events-none z-0" />

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.44 }}
        className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center"
      >
        <motion.h2
          variants={fade}
          id="rebel-finale"
          className="text-3xl sm:text-4xl font-extrabold font-serif text-[#B28C34] drop-shadow-[0_1px_4px_rgba(80,68,42,0.12)] uppercase tracking-wider mb-3 text-center"
        >
          The Ultimate Scent for the Bold & Beautiful
        </motion.h2>
        <div className="w-16 h-1 bg-gradient-to-r from-[#EED47B] via-[#B28C34] to-[#EED47B] rounded-full mx-auto mb-8" />

        <motion.p
          variants={fade}
          className="text-lg sm:text-xl text-[#514536] font-light leading-relaxed mb-5 max-w-xl"
        >
          <span className="font-semibold text-[#B28C34]">Rebel</span> is more than a fragrance, it’s a mood, a mindset and a moment. <br />
          For the woman who breaks rules with elegance,<br className="hidden sm:inline" /> who chases the sun, not the crowd.<br />
          Who knows that true seduction lies in being boldly, radiantly herself.
        </motion.p>
        <motion.p
          variants={fade}
          className="text-lg sm:text-xl text-[#B28C34] font-semibold italic leading-relaxed mb-8"
        >
          One spritz is all it takes.
        </motion.p>
        <motion.div variants={fade} className="mt-8">
          <motion.a
            href="/product"
            initial={{ scale: 1, y: 0, boxShadow: '0 2px 10px rgba(201,174,113,0.13)' }}
            whileHover={{
              scale: 1.05,
              y: -4,
              boxShadow: '0 12px 36px 0 rgba(201,174,113,0.23),0_0_0_4px_#C9AE7144',
              background: 'linear-gradient(90deg,#FFE186 0%,#F6C868 100%)',
              color: '#514536',
              borderColor: '#C9AE71'
            }}
            whileTap={{ scale: 0.97, y: 2 }}
            transition={{ type: 'spring', stiffness: 360, damping: 20 }}
            className="inline-block px-10 py-4 rounded-full bg-[#F9E6B9]/85 border border-[#C9AE71] text-[#B28C34] font-bold shadow-lg tracking-wide text-lg uppercase relative hover:ring-2 hover:ring-[#C9AE71]/20 transition-all duration-200"
          >
            Order REBEL now &mdash; 50ml
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  )
}
