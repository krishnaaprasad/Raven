export default function ManifestoSection({ statements }) {
  return (
    <section className="py-24 lg:py-32 bg-(--theme-soft) transition-colors">
      <div className="max-w-5xl mx-auto px-6">

        <h2
          className="
            font-[Crimson_Text]
            text-4xl sm:text-5xl
            font-light
            text-center
            mb-16
            text-(--theme-text)
          "
        >
          Our Manifesto
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
          {statements.map((statement, index) => (
            <div key={index} className="flex items-start gap-5">

              {/* subtle dot */}
              <span
                className="
                  mt-2
                  w-1.5
                  h-1.5
                  rounded-full
                  bg-(--theme-text)
                  opacity-40
                  shrink-0
                "
              />

              <p
                className="
                  font-[system-ui]
                  text-lg sm:text-xl
                  text-(--theme-text)
                  leading-relaxed
                "
              >
                {statement}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
