export default function CorePrinciple({ number, title, description }) {
  return (
    <div
      className="
        border-t border-(--theme-border)
        py-14
        transition-colors duration-500
      "
    >
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Number */}
        <div className="shrink-0">
          <span
            className="
              font-[Crimson_Text]
              text-6xl lg:text-7xl
              font-light
              text-(--theme-muted)
              opacity-40
            "
          >
            {number}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3
            className="
              font-[Crimson_Text]
              text-2xl sm:text-3xl lg:text-4xl
              font-light
              mb-4
              tracking-tight
              text-(--theme-text)
            "
          >
            {title}
          </h3>

          <p
            className="
              font-[system-ui]
              text-base sm:text-lg lg:text-xl
              text-(--theme-muted)
              leading-relaxed
              max-w-[auto]
            "
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
