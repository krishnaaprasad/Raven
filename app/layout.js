import { Geist, Geist_Mono } from "next/font/google";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import "./globals.css";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from "@vercel/analytics/next"
import Providers from "./Providers";
import WhatsAppButton from "@/components/WhatsAppButton";
import HomeMarquee from "@/components/HomeMarquee"; // ✅ new client component
import QuickViewModal from "@/app/collection/components/QuickViewModal";
import { QuickViewProvider } from "@/app/context/QuickViewContext";

import { Outfit } from 'next/font/google';
import { Cormorant_Garamond } from 'next/font/google';

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap', // Optional: controls font display behavior
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://www.ravenfragrance.in"),

  title: "Raven Fragrance",
  
  description:
    "Buy premium long-lasting perfumes online. Luxury fragrances, signature scents, elegant packaging, and fast delivery across India. Shop exclusive perfumes at Raven Fragrance.",

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  openGraph: {
    title: "Raven Fragrance — Premium Long-Lasting Perfumes",
    description:
      "Buy premium long-lasting perfumes online. Luxury fragrances, signature scents, elegant packaging, and fast delivery across India.",
    url: "https://www.ravenfragrance.in",
    siteName: "Raven Fragrance",
    images: [
      {
        url: "/IMG_9377.PNG", // ⭐ use the image you uploaded (place in public/)
        width: 1200,
        height: 630,
        alt: "Raven Fragrance Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Raven Fragrance — Premium Long-Lasting Perfumes",
    description:
      "Buy premium long-lasting perfumes online. Luxury fragrances, signature scents, elegant packaging, and fast delivery across India.",
    images: ["/IMG_9377.PNG"],
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.className} ${cormorantGaramond.className} `}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased ` }
      >
        <Providers>
          <QuickViewProvider>

            <HomeMarquee />
            <NavBar />

            <div className="pt-12">
              {children}
            </div>

            {/* 🔥 ONE GLOBAL MODAL */}
            <QuickViewModal />

            <Footer />
            <WhatsAppButton />
            <SpeedInsights />
            <Analytics />

          </QuickViewProvider>
        </Providers>
      </body>
    </html>
  );
}
