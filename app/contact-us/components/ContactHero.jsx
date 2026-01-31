"use client";

const ContactHero = ({ className = "" }) => {
  return (
    <section
      className={`
        pt-16 lg:pt-20
        pb-16 lg:pb-24
        px-6 lg:px-12
        bg-(--theme-bg)
        transition-colors duration-500
        ${className}
      `}
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="max-w-3xl">

          {/* Heading */}
          <h1
            className="
              font-[Crimson_Text]
              text-5xl lg:text-7xl
              font-light
              text-(--theme-text)
              mb-6 lg:mb-8
              leading-tight
            "
          >
            Let&apos;s Connect
          </h1>

          {/* Description */}
          <p
            className="
              font-[system-ui]
              text-lg lg:text-xl
              text-(--theme-muted)
              leading-relaxed
            "
          >
            We believe in direct, meaningful conversation. Whether you&apos;re
            seeking guidance on fragrance selection, have questions about our
            craft process, or simply want to share your experience with
            Raven—we&apos;re here to listen.
          </p>

        </div>
      </div>
    </section>
  );
};

export default ContactHero;
