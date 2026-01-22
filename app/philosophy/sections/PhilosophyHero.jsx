export default function PhilosophyHero({ title, subtitle }) {
  return (
    <section
      className="
        relative min-h-[60vh] flex items-center justify-center
        bg-(--theme-bg)
        text-(--theme-text)
        transition-colors duration-500
      "
    >
      <div className="max-w-[900px] mx-auto px-6 text-center">
        <h1
          className="
            font-[Crimson_Text]
            text-5xl lg:text-7xl
            font-light
            mb-6
            tracking-tight
          "
        >
          {title}
        </h1>

        <p
          className="
            font-[system-ui]
            text-lg sm:text-xl lg:text-2xl
            text-(--theme-muted)
            leading-relaxed
          "
        >
          {subtitle}
        </p>
      </div>
    </section>
  );
}
