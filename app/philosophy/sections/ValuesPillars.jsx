export default function ValuesPillars({ pillars }) {
  return (
    <section className="py-24 lg:py-32 bg-(--theme-bg) transition-colors">
      <div className="max-w-6xl mx-auto px-6">

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
          Core Values
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-14">
          {pillars.map((pillar, index) => (
            <div key={index} className="text-center space-y-4">

              <h3
                className="
                  font-[Crimson_Text]
                  text-2xl sm:text-3xl
                  font-light
                  text-(--theme-text)
                "
              >
                {pillar.title}
              </h3>

              <p
                className="
                  font-[system-ui]
                  text-base sm:text-lg
                  leading-relaxed
                  text-(--theme-muted)
                  max-w-[420px]
                  mx-auto
                "
              >
                {pillar.description}
              </p>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
