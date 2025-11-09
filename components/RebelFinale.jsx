'use client';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.21, duration: 1.05, ease: 'easeOut' },
  },
};

const fade = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: 'easeOut' } },
};

export default function RebelFinale() {
  return (
    <section
      className="relative w-full py-28 px-4 flex justify-center items-center overflow-hidden bg-[#FCF8F3] border-2 border-[#C9AE71]/15 shadow-[0_9px_45px_0_rgba(201,174,113,0.10)]"
      aria-labelledby="rebel-finale"
    >
      {/* Gold radial background */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[220px] bg-[radial-gradient(ellipse_at_center,rgba(201,174,113,0.13)_0%,rgba(252,248,243,0.97)_100%)] rounded-3xl blur-[44px] z-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(18)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0.13 + Math.random() * 0.13,
              scale: 0.5 + Math.random() * 0.8,
              x: Math.random() * 1100 - 540,
              y: Math.random() * 320 - 140,
            }}
            animate={{
              opacity: [0.08, 0.19, 0.09],
              scale: [0.8, 1.19, 0.8],
              y: `+=${55 + Math.random() * 75}`,
              transition: {
                duration: 7.7 + Math.random() * 2,
                delay: Math.random() * 2,
                repeat: Infinity,
                repeatType: 'mirror',
                ease: 'easeInOut',
              },
            }}
            className="absolute w-3 h-3 rounded-full bg-[#FFE186] blur-[8px]"
            style={{
              left: `calc(50% + ${Math.random() * 540 - 270}px)`,
              top: `${Math.random() * 480 - 80}px`,
            }}
          />
        ))}
      </div>

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
          className="text-3xl sm:text-4xl font-extrabold font-serif text-[#B28C34] uppercase tracking-wider mb-3 text-center"
        >
          The Ultimate Scent for the Bold & Beautiful
        </motion.h2>

        <div className="w-16 h-1 bg-gradient-to-r from-[#EED47B] via-[#B28C34] to-[#EED47B] rounded-full mx-auto mb-8" />

        <motion.p
          variants={fade}
          className="text-lg sm:text-xl text-[#514536] font-light leading-relaxed mb-5 max-w-xl"
        >
          <span className="font-semibold text-[#B28C34]">Rebel</span> is more than a fragrance,
          it’s a mood and a mindset.
          <br />
          Made for those who lead with confidence,
          <br className="hidden sm:inline" /> who follow their instincts, not the noise.
          <br />
          For anyone who knows that true allure lies in being unapologetically themselves.
        </motion.p>

        <motion.p
          variants={fade}
          className="text-lg sm:text-xl text-[#B28C34] font-semibold italic leading-relaxed mb-8"
        >
          One spritz is all it takes.
        </motion.p>

        {/* ORDER NOW Button (same as Add to Cart) */}
        <motion.div variants={fade} className="mt-8">
          <motion.a
            href="/product/rebel"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="relative group inline-flex items-center justify-center px-10 py-4 rounded-full overflow-hidden text-xm font-bold tracking-wide uppercase text-[#1b180d] transition-all shadow-[0_4px_10px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_15px_rgba(0,0,0,0.15)] font-[Manrope,sans-serif]"
            style={{
              background: 'linear-gradient(45deg, #a66d30, #ffe58e 50%, #e0b057)',
            }}
          >
            <span className="relative z-10">Order Now</span>
            <span className="absolute top-0 left-[-80%] w-[60%] h-full bg-gradient-to-tr from-transparent via-white/50 to-transparent rotate-[25deg] opacity-0 group-hover:opacity-100 animate-shine-slow"></span>
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Shimmer animation */}
      <style jsx>{`
        @keyframes shineSlow {
          0% {
            left: -80%;
            opacity: 0.75;
          }
          25% {
            opacity: 0.7;
          }
          50% {
            left: 120%;
            opacity: 0.25;
          }
          100% {
            left: 120%;
            opacity: 0;
          }
        }
        .animate-shine-slow {
          animation: shineSlow 3.8s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
