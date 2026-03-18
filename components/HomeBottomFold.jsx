"use client";

import dynamic from "next/dynamic";

// These are heavy components that are only needed once the user scrolls down.
// We lazily load them on the client to keep the initial page load super fast.
const Testimonials = dynamic(() => import("@/components/Testimonial"), { 
  ssr: false,
  loading: () => <div className="h-96 bg-(--theme-soft) animate-pulse" />
});

const InstagramGallery = dynamic(() => import("@/components/InstagramGallery"), { 
  ssr: false,
  loading: () => <div className="h-80 bg-(--theme-soft) animate-pulse" />
});

export default function HomeBottomFold() {
  return (
    <>
      <Testimonials />
      <InstagramGallery />
    </>
  );
}
