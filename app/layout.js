import { Geist, Geist_Mono } from "next/font/google";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import "./globals.css";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from "@vercel/analytics/next"
import Providers from "./Providers";
import WhatsAppButton from "@/components/WhatsAppButton";
import HomeMarquee from "@/components/HomeMarquee"; // ✅ new client component

import "froala-editor/css/froala_style.min.css";
import "froala-editor/css/froala_editor.pkgd.min.css";
import "froala-editor/css/themes/gray.min.css"; // premium theme


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <HomeMarquee /> {/* ✅ Client component handles fade + homepage check */}
          <NavBar />
          {children}
          <SpeedInsights />
          <Analytics/>
          <Footer />
        </Providers>
        <WhatsAppButton />
      </body>
    </html>
  );
}
