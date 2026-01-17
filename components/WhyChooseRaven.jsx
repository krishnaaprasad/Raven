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
      className={`py-12 sm:py-17 md:py-24 lg:py-25 bg-white relative overflow-hidden ${outfit.variable} ${garamond.variable}`}
    >
      <div className=" mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-start">

          {/* Left: Image Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {images.map((src, index) => (
              <div key={index} className="aspect-square overflow-hidden relative">
                <Image
                  src={src}
                  alt={`Craft process ${index + 1}`}
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            ))}
          </div>

          {/* Right: Content */}
          <div className="lg:pt-2">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 mb-4 sm:mb-6 tracking-tight leading-[1.1]">
              Craft Over Commerce
            </h2>

            <div className="mb-10 sm:mb-12 space-y-4">
              <p className="text-gray-700 font-body text-base sm:text-lg leading-relaxed">
                Our process starts with the formula. Each decision is deliberate.<br/>
                Each ingredient earns its place. Nothing exists without reason.
              </p>
            </div>

            <div className="space-y-10 sm:space-y-12">
              {craftItems.map((item, index) => (
                <div key={index} className="group">
                  <h3 className="font-display text-sm sm:text-base font-medium text-gray-900 uppercase tracking-[0.15em] mb-3 sm:mb-4 pb-2 border-b border-gray-200 inline-block">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 font-body text-sm sm:text-base leading-[1.8]">
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
