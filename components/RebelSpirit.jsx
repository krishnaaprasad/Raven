'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'

const container = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { staggerChildren: 0.22, duration: 1.05, ease: 'easeOut' } }
}
const fade = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: 'easeOut' } }
}

export default function RebelSpirit() {
  return (
    <section
      className="
        relative w-full py-24 md:py-32 px-4 flex justify-center items-center overflow-hidden
        bg-[#302a23]
        bg-[url('/spirit.png')] bg-center bg-cover bg-no-repeat
      "
      aria-labelledby="rebel-spirit"
    >
      {/* Gentle semi-dark overlay for luxury contrast */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none z-0" />

      {/* Gold aura and luxury overlays for blending */}
      <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-[530px] h-[240px] bg-[radial-gradient(ellipse_at_center,_rgba(246,200,104,0.13)_0%,_rgba(24,17,17,0.94)_95%)] pointer-events-none blur-[54px] z-0" aria-hidden="true" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(24,21,16,0)_76%,rgba(12,8,6,0.97)_99%)] z-0" aria-hidden="true" />

      <div className="relative z-10 max-w-6xl mx-auto w-full flex flex-col-reverse md:flex-row items-center md:items-stretch gap-12 md:gap-16">
        {/* Left: Blended, semi-overlapping floral image with glows */}
        <motion.div
          initial={{ opacity: 0, x: -48 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.5 }}
          className="w-full md:w-1/2 flex justify-center items-center relative"
        >
          {/* Additional subtle gold glow below image if desired */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-[420px] h-[220px] bg-[radial-gradient(ellipse,_rgba(246,200,104,0.09)_0%,rgba(24,17,17,0)_75%)] blur-2xl pointer-events-none z-0" />
          <Image
            src="/floral1.png"
            alt="Editorial luxury floral accent"
            width={370}
            height={420}
            className="rounded-3xl object-cover w-[295px] md:w-[340px] xl:w-[370px] border-none relative z-10"
            style={{
              background: 'transparent',
              mixBlendMode: 'lighten',
              filter: 'brightness(1.17) blur(0.04px)'
            }}
            draggable={false}
            priority={true}
          />
        </motion.div>

        {/* Right: Animated, refined text content */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          className="w-full md:w-1/2 flex flex-col justify-center z-10 text-center md:text-left"
        >
          <motion.h2
            variants={fade}
            id="rebel-spirit"
            initial={{ scale: 0.92 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 315, damping: 18, delay: 0.12 }}
            className="text-3xl sm:text-4xl font-extrabold font-serif text-[#FFE186] tracking-wide mb-5"
          >
            The Spirit of the Rebel Woman
          </motion.h2>
          {/* Underline with gold glow */}
          <div className="relative w-20 h-1 mx-auto md:mx-0 mb-6">
            <div className="w-full h-full rounded-full bg-gradient-to-r from-[#B4933A] via-[#FFE186] to-[#B4933A]" />
            <div
              className="absolute left-1/2 top-full -translate-x-1/2 mt-1 w-32 h-5
                bg-[radial-gradient(ellipse_at_center,_rgba(246,200,104,0.13)_0%,_rgba(255,225,134,0.03)_75%,transparent_100%)]
                pointer-events-none z-10"
              style={{ filter: 'blur(8px)' }}
              aria-hidden="true"
            />
          </div>
          {/* Main narrative */}
          <motion.p
            variants={fade}
            className="text-lg sm:text-xl text-[#FFD] font-light leading-relaxed mb-5 relative"
          >
            <span className="float-left text-4xl font-serif font-extrabold text-[#FFE186] leading-none mr-2 mt-0.5 select-none">
              A
            </span>
            <span className="font-semibold text-[#FFE186]">Dynamic, Daring Woman</span>
            <br />
            The Rebel is all energy, all charm — all her. She is fearlessly spontaneous, effortlessly radiant, and irresistibly joyful. Every morning, she’s ready for whatever the world brings — with charisma, light, and her signature scent.
          </motion.p>
          <motion.p
            variants={fade}
            className="text-base sm:text-lg text-[#B4933A] italic leading-relaxed mb-2"
          >
            Her secret weapon?{' '}
            <span className="relative inline-block">
              <span className="relative italic text-[#FFE186] z-10">high-voltage floral cocktail</span>
              <motion.span
                layout
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, type: "spring" }}
                className="absolute -bottom-px left-0 w-full h-[2px] bg-[#FFE186] origin-left"
                style={{ zIndex: 0 }}
              />
            </span>{' '}
            that unveils the most rebellious side of her untamed beauty.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
