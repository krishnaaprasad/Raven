"use client";

const ContactPhilosophy = ({ className = "" }) => {
  return (
    <section
      className={`
        py-16 lg:py-24
        px-6 lg:px-12
        bg-(--theme-soft)
        transition-colors duration-500
        ${className}
      `}
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="max-w-4xl mx-auto text-center">

          <h2
            className="
              font-[Crimson_Text]
              text-3xl lg:text-5xl
              font-light
              text-(--theme-text)
              mb-8
              leading-tight
            "
          >
            Our Approach to Communication
          </h2>

          <div
            className="
              space-y-6
              font-[system-ui]
              text-base lg:text-lg
              text-(--theme-muted)
              leading-relaxed
            "
          >
            <p>
              At Raven, we believe in the power of authentic conversation.
              Every inquiry receives personal attention-no automated responses,
              no generic templates. Just genuine dialogue between people who care
              about craft and intention.
            </p>

            <p>
              Whether you&apos;re seeking guidance on selecting the right
              fragrance, curious about our formulation process, or interested
              in partnership opportunities, we&apos;re here to engage
              meaningfully.
            </p>

            <p
              className="
                font-[Crimson_Text]
                text-(--theme-text)
                text-xl lg:text-2xl
                pt-4
              "
            >
              Presence over noise. Always.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ContactPhilosophy;
