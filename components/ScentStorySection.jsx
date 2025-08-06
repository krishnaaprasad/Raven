'use client'
import { motion } from 'framer-motion'
import { FaRegLemon, FaLeaf } from "react-icons/fa";
import { GiFlowerEmblem } from "react-icons/gi";

const container = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { staggerChildren: 0.22, duration: 1.05, ease: 'easeOut' } }
}
const fade = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: 'easeOut' } }
}

export default function ScentStorySection() {
  const notes = [
    {
      key: 1,
      icon: <FaRegLemon size={26} className="text-[#D09D1E]" />, // Warm gold orange
      label: "TOP NOTES",
      title: "Sparkling Orange Blossom",
      description: "A burst of citrusy freshness that awakens the senses",
      glowBg: "hover:bg-[rgba(208,157,30,0.18)]",
    },
    {
      key: 2,
      icon: <GiFlowerEmblem size={26} className="text-[#C47A90]" />, // Soft muted rose
      label: "HEART NOTES",
      title: "Indian Jasmine",
      description: "Exotic floral elegance with mysterious depth",
      glowBg: "hover:bg-[rgba(196,122,144,0.16)]",
    },
    {
      key: 3,
      icon: <FaLeaf size={26} className="text-[#8DA775]" />, // Soft mossy green
      label: "BASE NOTES",
      title: "Soft Vanilla, Bamboo Wood",
      description: "Warm, sensual foundation with woody sophistication",
      glowBg: "hover:bg-[rgba(141,167,117,0.16)]",
    },
  ];

  return (
    <section
      className="
        relative w-full py-16 px-4 overflow-hidden
        bg-[#FDF8F3]
        border-2 border-[#C9AE71]/20 shadow-[0_10px_50px_0_rgba(201,174,113,0.15)]
      "
      aria-labelledby="scent-story"
    >
      {/* Soft gold radial for dimension */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[190px] rounded-3xl
          bg-[radial-gradient(ellipse_at_center,_rgba(201,174,113,0.09)_0%,_rgba(253,248,243,0.97)_100%)]
          blur-[40px] z-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* Content container */}
      <div className="relative z-10 max-w-5xl mx-auto text-center text-neutral-900">

        {/* Section Heading */}
        <motion.h2
          id="scent-story"
          className="text-3xl sm:text-4xl font-extrabold font-serif text-[#B28C34] drop-shadow-[0_1px_6px_rgba(110,82,28,0.15)] mb-4"
          as="h2"
        >
          The <span className="text-[#4A463D]">Scent</span> Story
        </motion.h2>

        {/* Underline accent */}
        <div className="mx-auto w-20 h-1 rounded-full mb-10 bg-gradient-to-r from-[#E8D993] via-[#C9AE71] to-[#E8D993]" />

        {/* Intro Paragraph */}
        <motion.p
          className="text-lg sm:text-xl text-neutral-800 font-normal max-w-2xl mx-auto mb-14"
        >
          Together, they form a fresh and exotic elixir, impossible to forget a scent that glows on the skin like sunlight.
        </motion.p>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {notes.map(({ key, icon, label, title, description, glowBg }) => (
            <motion.div
              key={key}
              className={`
                flex flex-col items-start justify-center text-start min-h-[280px] w-full max-w-[360px]
                bg-white/90 border border-[#C9AE71] rounded-xl p-8
                relative transition-all duration-300 ease-in-out cursor-pointer
                backdrop-blur-lg shadow-md hover:scale-[1.05] ${glowBg}
                hover:shadow-[0_0_18px_3px_rgba(201,174,113,0.28)]
              `}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-3 text-[#C9AE71]">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#C9AE71] text-white font-bold text-sm select-none">
                  {key}
                </div>
                {icon}
              </div>
              <span className="text-[12px] font-semibold tracking-widest uppercase mb-2 text-[#BAA262]">{label}</span>
              <h3 className="text-[#4A463D] font-bold text-lg mb-3">{title}</h3>
              <p className="text-[#736B57] text-base leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>

        {/* Experience Journey Block */}
        <motion.div
          className="max-w-2xl mx-auto rounded-xl bg-white/90 border border-[#C9AE71] p-8 shadow-lg backdrop-blur-md"
          whileHover={{ scale: 1.03, boxShadow: "0 0 25px rgba(201,174,113,0.4)" }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-[#B28C34] font-extrabold text-xl mb-3 drop-shadow-sm hover:drop-shadow-lg transition-shadow duration-300">
            Experience the Complete Journey
          </h3>
          <p className="text-[#1b1a16] text-base max-w-md mx-auto leading-relaxed">
            From the first spritz to the lingering trail, discover how Rebel evolves on your skin.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
