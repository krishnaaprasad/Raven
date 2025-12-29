'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from "lucide-react";


const faqs = [
  {
    question: "What makes Raven Fragrance different from other luxury perfume brands?",
    answer:
      "Raven Fragrance is a rebel in the world of luxury perfumes. We source rare, ethically-harvested ingredients from around the globe and craft each scent by hand in small batches. Our philosophy-first approach means every Raven perfume tells a story and evokes deep emotions, not just pleasant smells.",
  },
  {
    question: "Are Raven Fragrance perfumes long-lasting?",
    answer:
      "Yes! Raven Fragrance perfumes are crafted with high concentrations of premium fragrance oils, ensuring exceptional longevity. Our Eau de Parfum formulations typically last 8–12 hours on skin, while our Extrait de Parfum collection can last even longer.",
  },
  {
    question: "What is the signature scent of Raven Fragrance?",
    answer:
      "Our signature 'Rebel' collection embodies the Raven spirit – bold, unapologetic, and unforgettable. The Rebel line features complex blends of rare oud, smoky incense, and unexpected floral notes that challenge conventional perfumery.",
  },
  {
    question: "Are Raven Fragrance products cruelty-free and sustainable?",
    answer:
      "Yes, Raven Fragrance is committed to ethical luxury. All our perfumes are cruelty-free and made with sustainably sourced ingredients and eco-conscious packaging.",
  },
  {
    question: "What's the difference between Eau de Parfum and Extrait de Parfum?",
    answer:
      "EDP contains 15–20% concentration and lasts 6–8 hours, while Extrait has 20–30% concentration for a richer scent that can last 12+ hours.",
  },
  {
    question: "What are top, heart, and base notes?",
    answer:
      "Top notes are the first impression, heart notes form the core, and base notes provide depth and longevity that linger all day.",
  },
  {
    question: "Does Raven Fragrance offer gift wrapping?",
    answer:
      "Yes! We offer luxury gift wrapping with handwritten notes for special occasions.",
  },
  {
    question: "Why does perfume smell different on different people?",
    answer:
      "Skin chemistry, pH, temperature, and lifestyle affect how fragrance develops — making each scent unique on every person.",
  },
  {
    question: "Are Raven Fragrance perfumes unisex?",
    answer:
      "Many of our fragrances are designed to transcend gender. Choose what resonates with your personality.",
  },
  {
    question: "How can I make my Raven perfume last longer?",
    answer:
      "Apply on pulse points, moisturize skin first, avoid rubbing, and consider light sprays on clothes for longevity.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="bg-[#fcfbf8] py-10 md:py-12">
      {/* ✅ JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-4xl mx-auto px-7">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="font-[Outfit] text-xs uppercase tracking-[0.3em] text-[#9a864c]">
            Questions & Answers
          </span>
          <h2 className="font-semibold text-3xl md:text-4xl lg:text-5xl text-[#1b180d] mt-7 mb-6">
            Frequently Asked Questions
          </h2>
          <p className="font-[Outfit] text-[#6b6453] max-w-2xl mx-auto">
            Everything you need to know about Raven Fragrance and choosing your
            signature scent.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
  {faqs.map((faq, i) => {
    const isOpen = openIndex === i;

    return (
      <div
        key={i}
        className="border border-[#e7e1cf] rounded-xl bg-white/70 overflow-hidden"
      >
        {/* QUESTION */}
        <button
          onClick={() =>
            setOpenIndex(isOpen ? null : i)
          }
          className="w-full flex justify-between items-center px-6 py-4 text-center font-[Cormorant_Garamond] text-base md:text-lg font-medium text-[#1b180d] hover:text-[#b28c34] transition cursor-pointer"
        >
          {faq.question}

          <ChevronDown
            className={`h-5 w-5 text-[#b28c34] transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* ANSWER */}
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isOpen
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden px-6 pb-2 font-[Outfit] text-sm md:text-base text-[#6b6453] leading-relaxed">
            {faq.answer}
          </div>
        </div>
      </div>
    );
  })}
</div>


        {/* CTA */}
        <div className="text-center mt-12">
          <p className="font-[Outfit] text-[#6b6453] mb-4">
            Still have questions about Raven Fragrance?
          </p>
          <a
            href="mailto:contact@ravenfragrance.in"
            className="font-[Outfit] text-[#b28c34] hover:text-[#9a864c] font-medium transition"
          >
            Contact our fragrance experts →
          </a>
        </div>
      </div>
    </section>
  );
}
