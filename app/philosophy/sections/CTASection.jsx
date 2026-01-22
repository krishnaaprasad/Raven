import Link from "next/link";

export default function CTASection({
  title,
  description,
  primaryLink,
  secondaryLink,
}) {
  return (
    <section className="py-24">
      <div
        className="
          max-w-[1000px]
          mx-auto
          px-6
        "
      >
        <div
          className="
            border
            border-(--theme-border)
            bg-(--theme-soft)
            rounded-2xl
            px-8 py-16
            text-center
            transition-colors duration-500
          "
        >
          <h2
            className="
              font-[Crimson_Text]
              text-4xl lg:text-5xl
              font-light
              mb-6
              tracking-tight
              text-(--theme-text)
            "
          >
            {title}
          </h2>

          <p
            className="
              font-[system-ui]
              text-base sm:text-lg lg:text-xl
              text-(--theme-muted)
              leading-relaxed
              max-w-[700px]
              mx-auto
              mb-10
            "
          >
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={primaryLink.href}
              className="
                px-10 py-3
                border border-(--theme-text)
                text-(--theme-bg)
                bg-(--theme-text)
                text-sm uppercase tracking-widest
                hover:opacity-90
                transition
              "
            >
              {primaryLink.text}
            </Link>

            <Link
              href={secondaryLink.href}
              className="
                px-10 py-3
                border border-(--theme-border)
                text-(--theme-text)
                text-sm uppercase tracking-widest
                hover:bg-(--theme-soft)
                transition
              "
            >
              {secondaryLink.text}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
