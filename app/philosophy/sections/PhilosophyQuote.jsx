export default function PhilosophyQuote({ quote, author }) {
  return (
    <section className="py-24 lg:py-32 bg-(--theme-soft) transition-colors">
      <div className="max-w-4xl mx-auto px-6 text-center">

        <blockquote
          className="
            font-[Crimson_Text]
            text-3xl sm:text-4xl
            font-light
            italic
            leading-relaxed
            text-(--theme-text)
            mb-8
          "
        >
          “{quote}”
        </blockquote>

        <cite
          className="
            not-italic
            font-[system-ui]
            text-sm sm:text-base
            tracking-wide
            uppercase
            text-(--theme-muted)
          "
        >
          — {author}
        </cite>

      </div>
    </section>
  );
}
