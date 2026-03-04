import PhilosophyInteractive from "./PhilosophyInteractive";

export const metadata = {
  title: "Philosophy – Raven Fragrance",
  description: "Discover the philosophy behind Raven Fragrance - intentional creation, quiet confidence, and timeless perfumery crafted with restraint.",
};

export default function Page() {
  const expandableSections = [
    {
      title: "The Anti-Marketing Approach",
      content:
        "Traditional fragrance marketing relies on aspiration, celebrity endorsement, and manufactured desire. We reject this approach entirely. Our marketing is anti-marketing-honest communication about what we create and why.",
    },
    {
      title: "Why Only Three Fragrances",
      content:
        "Our decision to offer just three signature scents is intentional. This restraint allows us to perfect each composition and maintain consistent quality rather than dilute our focus across dozens of offerings.",
    },
    {
      title: "The Role of Silence in Fragrance",
      content:
        "In perfumery, silence-the absence of unnecessary notes-is as important as the ingredients we include. We design fragrances with space between accords to create subtle complexity.",
    },
    {
      title: "Sustainability Through Intention",
      content:
        "Our sustainability approach is embedded in intentional creation. Small-batch production reduces waste, timeless design eliminates reinvention, and quality ingredients ensure longevity.",
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: expandableSections.map((section) => ({
      "@type": "Question",
      name: section.title,
      acceptedAnswer: {
        "@type": "Answer",
        text: section.content,
      },
    })),
  };

  return (
    <>
      <PhilosophyInteractive />

      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />
    </>
  );
}