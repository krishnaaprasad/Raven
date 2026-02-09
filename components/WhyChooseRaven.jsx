import Image from "next/image";
import { Playfair_Display, Inter, Montserrat, Darker_Grotesque } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"] });
const inter = Inter({ subsets: ["latin"] });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500"] });

const darker = Darker_Grotesque({
  subsets: ["latin"],
  weight: ["400"],
});

const CraftSection = () => {
  const images = [
    "/craft-small-batch.jpg",
    "/craft-composition.jpg",
    "/craft-transparent.jpg",
    "/craft-artisan.jpg",
  ];

  const principles = [
    {
      titles: "Small-Batch Integrity",
      desc: "Every bottle is part of a limited production run, ensuring quality control and formulation consistency that mass production cannot achieve.",
    },
    {
      titles: "Transparent Formulation",
      desc: "We share our concentration levels, ingredient sourcing, and creation process because authenticity requires openness.",
    },
    {
      titles: "Intentional Composition",
      desc: "Each note is chosen for purpose, not popularity. We build fragrances that evolve with intention rather than follow trends.",
    },
  ];

  return (
    <section className="bg-(--theme-bg) py-8 md:py-20 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-19 items-center">

          
         {/* LEFT GRID */}
<div className="flex justify-center lg:justify-start">
  {/* OUTER FRAME */}
  <div
    className="
      w-[340px] h-[340px]
      sm:w-[620px] sm:h-[500px]
      md:w-[880px] md:h-[530px]
      flex items-center justify-center
      bg-(--theme-soft)
      border border-(--theme-border)
      transition-colors duration-500
    "
  >
    {/* INNER GRID */}
    <div className="
  grid grid-cols-2 gap-3
  w-[65%]
  sm:w-[58%]
  lg:w-[55%]
">

      {images.map((src, i) => (
        <div
          key={i}
          className="
            relative aspect-square overflow-hidden
            bg-(--theme-soft)
            border border-(--theme-border)/40
          "
        >
          <Image
            src={src}
            alt=""
            fill
            className="object-cover grayscale hover:grayscale-0 transition duration-700 scale-[1.05] sm:scale-100"

          />
        </div>
      ))}
    </div>
  </div>
</div>


          {/* RIGHT CONTENT */}
          <div>
            <h2
              className={`${playfair.className} text-3xl sm:text-4xl md:text-5xl leading-tight text-(--theme-text) mb-6`}
            >
              Craft Over Commerce
            </h2>

            <p
              className={`${inter.className} text-[15px] sm:text-[16px] leading-[1.75] text-(--theme-muted) max-w-[520px] mb-10`}
            >
              Our approach to fragrance creation prioritizes formulation integrity
              over market demands. Every decision is made with intention, every
              ingredient chosen for purpose.
            </p>

            <div className="space-y-8">
              {principles.map((p, i) => (
                <div key={i}>
                  <h5
                    className={`${inter.className} text-[16px] text-(--theme-text) mb-2`}
                  >
                    {p.titles}
                  </h5>
                  <p
                    className={`${inter.className} text-[15px] leading-[1.75] text-(--theme-muted) max-w-[520px]`}
                  >
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quote */}
        <div className="mt-10 md:mt-12 flex justify-center">
          <blockquote className="italic text-[16px] sm:text-[21px] md:text-[23px] leading-[1.6] text-(--theme-muted)">
            <span className="opacity-30 mr-1">“</span>
            We believe trust comes from clarity
            <span className="opacity-30 ml-1">”</span>
          </blockquote>
        </div>
      </div>
    </section>
  );
};

export default CraftSection;
