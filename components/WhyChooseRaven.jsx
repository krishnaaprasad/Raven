import Image from "next/image";
import { Outfit, Cormorant_Garamond } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const garamond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

const WhyChooseRaven = () => {
  const craftItems = [
    {
      title: "Small-Batch Integrity",
      description:
        "Every Raven fragrance is produced in limited runs. This allows focus on quality control, fresh production, and formulation consistency.",
    },
    {
      title: "Intentional Composition",
      description:
        "Raven fragrances are designed to last through the day, sit close to the skin, and evolve naturally over time.",
    },
    {
      title: "Transparent by Design",
      description:
        "Clearly stated concentration. Thoughtful ingredient sourcing. Honest performance expectations. No exaggeration. No gimmicks. Fragrance made properly.",
    },
  ];

  const images = [
    "/craft-small-batch.jpg",
    "/craft-composition.jpg",
    "/craft-transparent.jpg",
    "/craft-artisan.jpg",
  ];

  return (
    <section
      className={`py-6 sm:py-8 md:py-14 lg:py-15 bg-white relative overflow-hidden ${outfit.variable} ${garamond.variable}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-21 xl:gap-21 items-start">


         {/* Left Column */}
<div className="flex h-full items-center  justify-center lg:justify-center">
  <div className="w-full grid grid-cols-2 gap-3 sm:gap-4 max-w-[340px] sm:max-w-[380px] lg:max-w-[420px]">
    {images.map((src, index) => (
      <div key={index} className="aspect-square overflow-hidden relative">
        <Image
          src={src}
          alt={`Craft process ${index + 1}`}
          fill
          className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
          sizes="(max-width: 640px) 170px, (max-width: 1024px) 190px, 210px"
        />
      </div>
    ))}
  </div>
</div>


          {/* Right: Content */}
          
<div className="lg:pt-3">
  <h2
    className={`${garamond.className} text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 mb-0 sm:mb-4 tracking-tight leading-[1.1]`}
  >
    Craft Over Commerce
  </h2>


            <div className="mb-6 sm:mb-8 space-y-2">
              <p className="text-gray-700 font-body text-base sm:text-lg leading-relaxed">
                Our process starts with the formula. Each decision is deliberate.<br/>
                Each ingredient earns its place. Nothing exists without reason.
              </p>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {craftItems.map((item, index) => (
                <div key={index} className="group">
                  <h3 className="font-display text-sm sm:text-lg font-medium text-gray-900  tracking-[0.15em] mb-1 sm:mb-0 pb-1 inline-block">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 font-display text-sm sm:text-base leading-[1.8]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quote Section */}
<div className="text-center max-w-2xl mx-auto mt-10 sm:mt-7 lg:mt-7 pt-7 sm:pt-9 border-t border-gray-100">
  
  <blockquote className="font-display italic text-xl sm:text-2xl md:text-3xl font-light text-gray-800 tracking-tight leading-relaxed">
    <span className="text-gray-300 mr-1">“</span>
    We believe trust comes from clarity
    <span className="text-gray-300 ml-1">”</span>
  </blockquote>
</div>

      </div>
    </section>
  );
};

export default WhyChooseRaven;
