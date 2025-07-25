'use client'
import { motion } from 'framer-motion'

const container = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { staggerChildren: 0.22, duration: 1.05, ease: 'easeOut' } }
}
const fade = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: 'easeOut' } }
}

export default function RebelFinale() {
  return (
    <section  className="
    relative w-full py-28 px-4 flex justify-center items-center overflow-hidden
     shadow-[0_12px_48px_0_rgba(246,200,104,0.12)] bg-[#252119]
  "
  aria-labelledby="rebel-finale"
>
  {/* Background Image Layer & Overlay */}
  <div className="absolute inset-0 z-0">
    <img
      src="/finalbg.png"
      alt=""
      className="w-full h-full object-cover object-center brightness-[0.62]"
    />
    <div className="absolute inset-0 bg-black/70"></div>
  </div>
      {/* Living gold particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(18)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0.12 + Math.random() * 0.18,
              scale: 0.4 + Math.random() * 0.8,
              x: Math.random() * 1100 - 540,
              y: Math.random() * 370 - 170
            }}
            animate={{
              opacity: [0.1, 0.21, 0.08],
              scale: [0.9, 1.2, 0.9],
              y: `+=${55 + Math.random()*85}`,
              transition: { duration: 8.2 + Math.random()*2, delay: Math.random()*2.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }
            }}
            className="absolute w-3 h-3 rounded-full bg-[#FFE186] blur-[7px]"
            style={{ left: `calc(50% + ${Math.random()*540-270}px)`, top: `${Math.random()*540-100}px` }}
          />
        ))}
      </div>
      {/* Soft orb accent below button */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[180px] h-[60px] bg-[radial-gradient(ellipse_at_center,_rgba(255,225,134,0.16)_0%,_rgba(255,255,255,0)_95%)] blur-2xl pointer-events-none z-0" />

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
          initial={{ scale: 0.93, y: 28, opacity: 0 }}
          whileInView={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 16, delay: 0.06 }}
          className="text-4xl sm:text-5xl font-serif font-extrabold text-transparent bg-gradient-to-r from-[#FFE186] via-[#DAC986] to-[#B4933A] bg-clip-text tracking-wide mb-5 drop-shadow-[0_6px_28px_rgba(246,200,104,0.10)]"
        >
          The Ultimate Scent for the Bold & Beautiful
        </motion.h2>
        <motion.div
          variants={fade}
          initial={{ width: 0 }}
          whileInView={{ width: "4.2rem" }}
          transition={{ duration: 1.1, type: "spring", delay: 0.21 }}
          className="mx-auto h-1 bg-gradient-to-r from-[#B4933A] via-[#FFE186] to-[#B4933A] rounded-full mb-8"
          style={{ maxWidth: '4.2rem' }}
        />
        <motion.p
          variants={fade}
          className="text-lg sm:text-xl text-[#DAC986] font-light leading-relaxed mb-5 max-w-xl"
        >
          <span className="font-semibold text-[#FFE186]">Rebel</span> is more than a fragrance—it’s a mood, a mindset, a moment.<br />For the woman who breaks rules with elegance,<br className="hidden sm:inline" /> who chases the sun, not the crowd.<br />Who knows that true seduction lies in being boldly, radiantly herself.
        </motion.p>
        <motion.p
          variants={fade}
          className="text-lg sm:text-xl text-[#B4933A] font-semibold italic leading-relaxed mb-8"
        >
          One spritz is all it takes.
        </motion.p>
        <motion.div variants={fade} className="mt-8">
          <motion.a
            href="/shop"
            initial={{ scale: 1, y: 0, boxShadow: '0 2px 10px rgba(255,225,134,0.13)' }}
            whileHover={{
              scale: 1.07,
              y: -4,
              boxShadow: '0 12px 36px 0 rgba(255,225,134,0.23),0_0_0_4px_#FFE18644',
              background: 'linear-gradient(90deg, #FFE186 5%, #F6C868 95%)',
              color: '#181510',
              borderColor: '#DAC986'
            }}
            whileTap={{ scale: 0.97, y: 2 }}
            transition={{ type: 'spring', stiffness: 360, damping: 20 }}
            className="inline-block px-10 py-4 rounded-full bg-[#191510]/90 border border-[#FFE186] text-[#FFE186] font-bold shadow-lg tracking-wide text-lg uppercase relative hover:ring-2 hover:ring-[#FFE186]/30 transition-all duration-300"
          >
            Order REBEL now &mdash; 50ml
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  )
}
