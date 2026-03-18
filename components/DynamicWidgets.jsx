"use client";

import dynamic from "next/dynamic";

// These widgets don't need to be part of the initial HTML (SSR)
// This saves valuable time during the initial page load.
const HomeMarquee = dynamic(() => import("@/components/HomeMarquee"), { ssr: false });
const QuickViewModal = dynamic(() => import("@/app/collection/components/QuickViewModal"), { ssr: false });
const WhatsAppButton = dynamic(() => import("@/components/WhatsAppButton"), { ssr: false });

export function HomeMarqueeWidget() {
  return <HomeMarquee />;
}

export function QuickViewWidget() {
  return <QuickViewModal />;
}

export function WhatsAppWidget() {
  return <WhatsAppButton />;
}
