'use client'
import { motion } from 'framer-motion'
// Optional: Uncomment if you wish to try text balancing enhancements
// import Balancer from 'react-wrap-balancer'

const container = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.22, duration: 1.05, ease: 'easeOut' }
  }
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
        bg-[#181510]
        bg-[url('/spiritbg.png')] bg-center bg-cover bg-no-repeat shadow-[0_12px_48px_0_rgba(246,200,104,0.12)
      "
      aria-labelledby="rebel-spirit"
    >
      {/* Gold aura and luxury overlays for seamless blending */}
      <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-[530px] h-[240px] bg-[radial-gradient(ellipse_at_center,_rgba(246,200,104,0.17)_0%,_rgba(24,17,17,0.93)_95%)] pointer-events-none blur-[54px] z-0" aria-hidden="true" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(24,21,16,0)_67%,rgba(12,8,6,0.958)_98%)] z-0" aria-hidden="true" />

      <div className="relative z-10 max-w-6xl mx-auto w-full flex flex-col-reverse md:flex-row items-center md:items-stretch gap-12 md:gap-16">
        {/* Left: Blended, semi-overlapping floral image with glows */}
        <motion.div
          initial={{ opacity: 0, x: -48 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.5 }}
          className="w-full md:w-1/2 flex justify-center items-center relative"
        >
          {/* Layered blurred gold for glow */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-[420px] h-[220px] bg-[radial-gradient(ellipse,_rgba(246,200,104,0.14)_0%,rgba(24,17,17,0)_75%)] blur-2xl pointer-events-none z-0" />
          {/* Realistic floral/botanical image blends into background */}
          <img
            src="/floral.png"
            alt="Editorial luxury floral accent"
            className="rounded-3xl object-cover w-[295px] md:w-[340px] xl:w-[370px] shadow-[0_7px_24px_rgba(246,200,104,0.14)] border-none relative z-10"
            style={{ background: 'transparent', mixBlendMode: 'lighten', filter: 'brightness(1.14) blur(0.1px)' }}
            draggable={false}
          />
        </motion.div>

        {/* Right: Animated, highly refined text content */}
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
          {/* Animated gold divider */}
          <motion.div
            variants={fade}
            initial={{ width: 0 }}
            animate={{ width: "4rem" }}
            transition={{ duration: 1, type: "spring", delay: 0.2 }}
            className="mx-auto md:mx-0 h-1 bg-gradient-to-r from-[#B4933A] via-[#FFE186] to-[#B4933A] rounded-full mb-6"
            style={{ maxWidth: '4rem' }}
          />
          {/* Main rich narrative with editorial drop cap */}
          <motion.p
            variants={fade}
            className="text-lg sm:text-xl text-[#DAC986] font-light leading-relaxed mb-5 relative"
          >
            <span className="float-left text-4xl font-serif font-extrabold text-[#FFE186] leading-none mr-2 mt-0.5 select-none">
              A
            </span>
            <span className="font-semibold text-[#FFE186]"> Dynamic, Daring Woman</span>
            <br />
            The Rebel is all energy, all charm — all her. She is fearlessly spontaneous, effortlessly radiant, and irresistibly joyful. Every morning, she’s ready for whatever the world brings — with charisma, light, and her signature scent.
          </motion.p>
          {/* Elegant animated underline on key phrase */}
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
