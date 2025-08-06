'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'

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
      className="relative w-full py-24 md:py-32 px-4 flex items-center overflow-hidden bg-[#FCF8F3] border-2 border-[#C9AE71]/15 shadow-[0_9px_45px_0_rgba(201,174,113,0.10)]"
      aria-labelledby="rebel-spirit"
    >
      {/* Background image using next/image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/raven_bg.png" // Change to your image path
          alt="Banner background"
          fill
          className="object-cover object-right md:object-center"
          priority
        />
      </div>

      {/* Floating gold flecks */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${6 + Math.random() * 8}px`,
              height: `${6 + Math.random() * 10}px`,
              left: `${5 + Math.random() * 89}%`,
              top: `${8 + Math.random() * 78}%`,
              background: 'rgba(178,140,52,0.14)',
              filter: 'blur(1.3px)'
            }}
          />
        ))}
      </div>

      {/* Gold radial glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] h-[200px] rounded-3xl blur-[48px] z-10 pointer-events-none" />

      {/* Right side content - with subtle white glow */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.55 }}
        className="relative z-20 w-full md:w-1/2 ml-auto flex flex-col justify-center px-6 py-8 md:px-9 md:py-11 text-center md:text-left"
      >
        <motion.h2
          variants={fade}
          id="rebel-spirit"
          initial={{ scale: 0.92 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 315,
            damping: 18,
            delay: 0.12
          }}
          className="text-3xl sm:text-4xl font-extrabold font-serif text-[#9c6f0c] drop-shadow-md tracking-wide mb-5 uppercase"
        >
          The Spirit of the Rebel Woman
        </motion.h2>

        <div className="relative w-20 h-1 mx-auto mb-7">
          <div className="w-full h-full rounded-full bg-gradient-to-r from-[#B28C34] via-[#F9E8A7] to-[#B28C34]" />
          <div
            className="absolute left-1/2 top-full -translate-x-1/2 mt-1 w-36 h-6 bg-[radial-gradient(ellipse_at_center,_rgba(178,140,52,0.13)_0%,_rgba(249,232,167,0.03)_80%,transparent_100%)] pointer-events-none"
            style={{ filter: 'blur(7px)' }}
            aria-hidden="true"
          />
        </div>

        <motion.p
          variants={fade}
          className="text-lg sm:text-xl text-[#433A20] font-medium leading-relaxed mb-5 drop-shadow-sm"
        >
          <span className="text-4xl font-serif font-extrabold text-[#9e730d] leading-none mr-2 mt-0.5 select-none">
            A
          </span>
          <span className="font-bold text-[#9e730d]">
            Dynamic, Daring Woman
          </span>
          <br />
          The Rebel is all energy, all charm, all her. She is fearlessly spontaneous, effortlessly radiant, and irresistibly joyful. Every morning, she’s ready for whatever the world brings with charisma, light, and her signature scent.
        </motion.p>

        <motion.p
          variants={fade}
          className="text-base sm:text-lg italic text-[#3a300d] leading-relaxed mb-2 drop-shadow-sm"
        >
          Her secret weapon?{' '}
          <span className="relative inline-block">
            <span className="relative italic text-[#887017] z-10">
              high-voltage floral cocktail
            </span>
            <motion.span
              layout
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, type: 'spring' }}
              className="absolute origin-left"
              style={{ zIndex: 0 }}
            />
          </span>{' '}
          that unveils the most rebellious side of her untamed beauty.
        </motion.p>
      </motion.div>
    </section>
  )
}
