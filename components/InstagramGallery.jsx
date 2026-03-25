"use client";

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="w-full overflow-hidden rounded-xl">

          <iframe
            src="https://snapwidget.com/embed/1120701"
            className="snapwidget-widget w-full"
            allowtransparency="true"
            frameBorder="0"
            scrolling="no"
            title="Posts from Instagram"
            style={{
              border: "none",
              overflow: "hidden",
              width: "100%",
              aspectRatio: "1040 / 360"
            }}
          />

        </div>

      </div>

    </section>
  );
}