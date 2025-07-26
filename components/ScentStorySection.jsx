'use client'
import { FaRegLemon, FaLeaf } from "react-icons/fa";
import { GiFlowerEmblem } from "react-icons/gi";

export default function ScentStorySection() {
  const notes = [
    {
      key: 1,
      icon: <FaRegLemon size={26} className="text-[#FFA500]" />,
      label: "TOP NOTES",
      title: "Sparkling Orange Blossom",
      description: "A burst of citrusy freshness that awakens the senses",
      glowBg: "hover:bg-[rgba(246,190,67,0.18)]",
    },
    {
      key: 2,
      icon: <GiFlowerEmblem size={26} className="text-[#e66d81]" />,
      label: "HEART NOTES",
      title: "Indian Jasmine",
      description: "Exotic floral elegance with mysterious depth",
      glowBg: "hover:bg-[rgba(180,147,220,0.18)]",
    },
    {
      key: 3,
      icon: <FaLeaf size={26} className="text-[#78BB2C]" />,
      label: "BASE NOTES",
      title: "Soft Vanilla, Bamboo Wood",
      description: "Warm, sensual foundation with woody sophistication",
      glowBg: "hover:bg-[rgba(141,193,120,0.16)]",
    },
  ];

  return (
    <section
      className="
        relative w-full py-14 px-2
        bg-[#191919]
        bg-[url('/spirit.png')] bg-center bg-cover bg-no-repeat
        before:absolute before:inset-0 before:bg-black/70 before:z-0
      "
      aria-labelledby="scent-story"
    >
      {/* Content container with higher stacking context so it appears above the overlay */}
      <div className="relative z-10 max-w-5xl mx-auto text-center text-[#FFE186]">
        <h2 id="scent-story" className="text-3xl font-extrabold font-serif mb-3">
          The <span className="text-[#ffffff]">Scent</span> Story
        </h2>
        <p className="text-[15px] max-w-2xl mx-auto mb-10 text-[#DAC986]">
          Together, they form a fresh and exotic elixir, impossible to forget — a scent that glows on the skin like sunlight.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {notes.map(({ key, icon, label, title, description, glowBg }) => (
            <div
              key={key}
              className={`
                flex flex-col items-start justify-center text-start min-h-[260px] w-full sm:max-w-[360px]
                bg-[#191919] border border-[#B4933A] rounded-lg p-6
                relative transition-all duration-300 ease-in-out overflow-hidden cursor-pointer
                hover:scale-105 ${glowBg}
              `}
            >
              <div className="flex items-center justify-start gap-2 mb-2">
                <div className="w-7 h-7 flex items-center justify-center bg-[#B4933A] text-[#191919] font-bold rounded-full text-sm">
                  {key}
                </div>
                {icon}
              </div>
              <span className="text-[13px] font-semibold tracking-widest uppercase text-[#B4933A] mb-2">{label}</span>
              <h3 className="text-white font-bold text-base mb-2">{title}</h3>
              <p className="text-[#DAC986] text-sm">{description}</p>
            </div>
          ))}
        </div>
        <div className="bg-[#191919] border border-[#B4933A] rounded-lg py-7 px-5 max-w-2xl mx-auto">
          <h3 className="text-[#f3bd1c] font-extrabold text-base mb-2 hover:drop-shadow-[0_0_8px_#FFE186] transition-all duration-300">
            Experience the Complete Journey
          </h3>
          <p className="text-[#DAC986] text-sm max-w-md mx-auto">
            From the first spritz to the lingering trail, discover how Rebel evolves on your skin.
          </p>
        </div>
      </div>
    </section>
  );
}
