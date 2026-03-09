"use client";

import Script from "next/script";
import { ArrowRight } from "lucide-react";

export default function InstagramGallery() {
  return (
    <section className="py-16 bg-(--theme-bg)">

      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">

        <p className="font-[system-ui] text-xs uppercase tracking-[0.35em] text-(--theme-muted) mb-3">
          @ravenfragrance.in
        </p>

        <h2 className="font-[Crimson_Text] text-3xl sm:text-4xl md:text-5xl text-(--theme-text) mb-4">
          Stay in Touch
        </h2>

        <a
          href="https://www.instagram.com/ravenfragrance.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-[system-ui] text-sm text-(--theme-text) hover:opacity-80 transition"
        >
          Follow us on Instagram
          <ArrowRight size={16} />
        </a>

      </div>

      {/* INSTAGRAM FEED */}
      <div className="max-w-7xl mx-auto px-6">

        <Script src="https://cdn.lightwidget.com/widgets/lightwidget.js" strategy="lazyOnload" />

        <iframe
          src="https://lightwidget.com/widgets/da148bfeba415b6aba61614948badef6.html"
          scrolling="no"
          allowtransparency="true"
          loading="lazy"
          className="lightwidget-widget w-full border-0 overflow-hidden"
          style={{ height: "600px" }}
        />

      </div>

    </section>
  );
}