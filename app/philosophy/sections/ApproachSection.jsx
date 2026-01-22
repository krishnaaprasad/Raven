import Image from "next/image";

export default function ApproachSection({ approaches }) {
  return (
    <section className="py-24 lg:py-32 bg-(--theme-bg) transition-colors">
      <div className="max-w-6xl mx-auto px-6">

        <h2
          className="
            font-[Crimson_Text]
            text-4xl sm:text-5xl
            font-light
            text-center
            mb-20
            text-(--theme-text)
          "
        >
          Our Approach
        </h2>

        <div className="space-y-28">
          {approaches.map((approach, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } gap-12 lg:gap-20 items-center`}
            >
              {/* Image */}
              <div className="flex-1 w-full">
                <div className="relative w-full h-[380px] lg:h-[480px] overflow-hidden bg-[#f5f5f5] dark:bg-[#1a1a1a]">
                  <Image
                    src={approach.image}
                    alt={approach.alt || approach.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 space-y-6">
                <h3
                  className="
                    font-[Crimson_Text]
                    text-3xl sm:text-4xl
                    font-light
                    text-(--theme-text)
                  "
                >
                  {approach.title}
                </h3>

                <p
                  className="
                    font-[system-ui]
                    text-base sm:text-lg
                    leading-relaxed
                    text-(--theme-muted)
                    max-w-[520px]
                  "
                >
                  {approach.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
