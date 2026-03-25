"use client";

import Script from "next/script";
import { ArrowRight } from "lucide-react";

export default function InstagramGallery() {
  return (
    <section className="py-10 bg-(--theme-bg)">

      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-6 mb-6 text-center">

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
          className="inline-flex items-center gap-2 font-[system-ui] text-sm text-(--theme-text)"
        >
          Follow us on Instagram
          <ArrowRight size={16} />
        </a>

      </div>

      {/* FEED */}
      <div className="w-full mx-auto px-4">

        <Script
          src="/scripts/lightwidget.js"
          strategy="lazyOnload"
        />

        <div className="w-full overflow-hidden rounded-xl">

          <iframe
            title="Instagram gallery"
            src="http://lightwidget.com/widgets/8c33a1b4d36e5ea4ab3b54ece0db1ae0.html"
            allowtransparency="true"
            loading="lazy"
            className="lightwidget-widget w-full border-0"
            style={{
              width: "100%",
              height: "clamp(420px, 75vw, 900px)"
            }}
          />

        </div>

      </div>

    </section>
  );
}