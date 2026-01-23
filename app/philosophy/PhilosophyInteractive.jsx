'use client';

import PhilosophyHero from './sections/PhilosophyHero';
import CorePrinciple from './sections/CorePrinciple';
import ManifestoSection from './sections/ManifestoSection';
import PhilosophyQuote from './sections/PhilosophyQuote';
import ApproachSection from './sections/ApproachSection';
import ValuesPillars from './sections/ValuesPillars';
import ExpandableContent from './sections/ExpandableContent';
import CTASection from './sections/CTASection';

export default function PhilosophyInteractive() {

  const heroData = {
    title: "Philosophy",
    subtitle: "Fragrance with intention. Presence over noise. Strength held back."
  };

  const corePrinciples = [
    {
      number: "01",
      title: "Intentional Creation",
      description: "Every fragrance we create is born from purpose, not trend. We reject the noise of seasonal releases and celebrity endorsements. Instead, we focus on timeless compositions that speak to the wearer's authentic self. Our small-batch approach ensures each bottle receives the attention and care it deserves, resulting in fragrances that feel personal rather than mass-produced."
    },
    {
      number: "02",
      title: "Formulation Integrity",
      description: "We believe transparency builds trust. Our commitment to formulation integrity means using high-quality ingredients at meaningful concentrations. No fillers, no shortcuts, no compromises. Each component is selected for its contribution to the overall composition, creating fragrances that evolve beautifully on the skin and maintain their character throughout the day."
    },
    {
      number: "03",
      title: "Quiet Confidence",
      description: "True presence doesn't announce itself—it's felt, not performed. Our fragrances embody this philosophy, offering subtle complexity that reveals itself over time. We design for those who understand that strength is most powerful when held back, creating scents that draw people closer rather than overwhelming the room."
    },
    {
      number: "04",
      title: "Restraint as Luxury",
      description: "In a world of excess, restraint becomes the ultimate luxury. We apply this principle to every aspect of our brand—from our minimalist packaging to our curated collection of just three signature scents. This intentional limitation allows us to perfect each fragrance rather than dilute our focus across dozens of offerings."
    }
  ];

  const manifestoStatements = [
    "We reject the performance of luxury in favor of its authentic experience",
    "We believe fragrance should enhance presence, not announce arrival",
    "We choose quality over quantity, depth over breadth, intention over impulse",
    "We create for individuals who value substance over spectacle",
    "We embrace the space between rebellion and refinement",
    "We understand that true confidence needs no validation"
  ];

  const quoteData = {
    quote: (
  <>
    Strength is most powerful when held back.
    <br />
    Presence is most felt when not performed.
  </>
),
    author: "Raven Philosophy"
  };

  const approaches = [
    {
      title: "Small-Batch Craftsmanship",
      description: "Our commitment to small-batch production ensures every bottle receives meticulous attention. We work with master perfumers who share our vision of intentional luxury, creating fragrances that balance complexity with wearability. This approach allows us to maintain strict quality control and make adjustments based on seasonal ingredient variations, ensuring consistency without compromise.",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_16b86ed99-1764763413688.png",
      alt: "Close-up of artisan perfumer carefully measuring essential oils into glass beaker in minimalist laboratory setting"
    },
    {
      title: "Ingredient Transparency",
      description: "We believe you deserve to know what you're wearing. Our fragrances use natural and synthetic ingredients selected for their quality and performance. We're transparent about our formulations, sharing concentration levels and key components. This openness reflects our respect for discerning customers who value authenticity over marketing mystique.",
      image: "https://images.unsplash.com/photo-1573197328573-a8813b331688",
      alt: "Array of natural perfume ingredients including dried flowers, essential oil bottles, and botanical extracts arranged on white marble surface"
    },
    {
      title: "Mood-Based Design",
      description: "Rather than following traditional fragrance families, we design around emotional states and occasions. Each scent is crafted to support a specific mindset—whether you need quiet confidence for important meetings, rebellious energy for creative work, or balanced presence for everyday life. This approach makes fragrance selection intuitive and personal.",
      image: "https://images.unsplash.com/photo-1725393197042-7b7691ba7446",
      alt: "Serene woman with closed eyes in black turtleneck against dark background, embodying peaceful confidence and intentional presence"
    }
  ];

  const valuePillars = [
    { title: "Authenticity", description: "We reject performative luxury in favor of genuine quality and honest communication with our customers." },
    { title: "Restraint", description: "Our curated approach to fragrance creation and brand expression reflects our belief in intentional limitation." },
    { title: "Craftsmanship", description: "Every aspect of our process prioritizes skill, attention to detail, and respect for the art of perfumery." },
    { title: "Presence", description: "We create fragrances that enhance your natural confidence rather than mask or overwhelm it." },
    { title: "Integrity", description: "Transparency in ingredients, honest pricing, and consistent quality define our relationship with customers." },
    { title: "Timelessness", description: "We design for longevity, creating fragrances that transcend trends and remain relevant across seasons." }
  ];

  const expandableSections = [
    {
      title: "The Anti-Marketing Approach",
      content: "Traditional fragrance marketing relies on aspiration, celebrity endorsement, and manufactured desire. We reject this approach entirely. Our marketing is anti-marketing—honest communication about what we create and why. We don't promise transformation or status. We offer well-crafted fragrances for people who appreciate quality without needing external validation. This honesty attracts customers who share our values and creates relationships built on mutual respect rather than manufactured need."
    },
    {
      title: "Why Only Three Fragrances",
      content: "Our decision to offer just three signature scents is intentional, not limiting. This restraint allows us to perfect each composition, maintain consistent quality, and avoid the dilution that comes with extensive product lines. Each fragrance represents years of development and refinement. By focusing our energy on three exceptional offerings rather than dozens of adequate ones, we deliver the depth and complexity that discerning customers expect. This approach also reflects our philosophy that more isn't always better—sometimes it's just more."
    },
    {
      title: "The Role of Silence in Fragrance",
      content: "In perfumery, silence—the absence of unnecessary notes—is as important as the ingredients we include. We design our fragrances with generous space between accords, allowing each element to breathe and evolve naturally on the skin. This restraint creates complexity through subtlety rather than overwhelming the senses with competing notes. The result is fragrances that reveal themselves gradually, rewarding attention and creating intimate experiences rather than making bold statements."
    },
    {
      title: "Sustainability Through Intention",
      content: "Our approach to sustainability isn't about marketing claims or certifications—it's embedded in our philosophy of intentional creation. Small-batch production reduces waste. Timeless design eliminates the need for constant reinvention. Quality ingredients and construction mean our products last. We focus on creating fragrances people will treasure and use completely rather than disposable luxury that ends up forgotten. This practical approach to sustainability aligns with our values of restraint and authenticity."
    }
  ];

  const ctaData = {
    title: "Experience Intentional Fragrance",
    description: "Explore our collection of three signature scents, each crafted to embody our philosophy of quiet confidence and authentic presence.",
    primaryLink: { text: "View Fragrances", href: "/collection" },
    secondaryLink: { text: "Contact Us", href: "/contact-us" }
  };

  return (
    <div className="min-h-screen bg-(--theme-bg) transition-colors duration-500">
      <div className="h-20 lg:h-24" />

      <PhilosophyHero title={heroData.title} subtitle={heroData.subtitle} />

      <section className="py-24 lg:py-32">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <h2 className="font-[Crimson_Text] text-4xl lg:text-5xl font-light text-(--theme-text) mb-20 text-center">
            Core Principles
          </h2>
          {corePrinciples.map((p, i) => (
            <CorePrinciple key={i} {...p} />
          ))}
        </div>
      </section>

      <ManifestoSection statements={manifestoStatements} />
      <PhilosophyQuote quote={quoteData.quote} author={quoteData.author} />
      <ApproachSection approaches={approaches} />
      <ValuesPillars pillars={valuePillars} />
      <ExpandableContent sections={expandableSections} />

      <CTASection
        title={ctaData.title}
        description={ctaData.description}
        primaryLink={ctaData.primaryLink}
        secondaryLink={ctaData.secondaryLink}
      />
    </div>
  );
}
