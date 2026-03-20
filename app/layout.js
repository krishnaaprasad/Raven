import Script from "next/script";
import { ThemeProvider } from "./theme-provider";
import { Crimson_Text, Cinzel } from 'next/font/google';
import localFont from 'next/font/local';

// Core layout components
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Providers from "./Providers";
import { QuickViewProvider } from "@/app/context/QuickViewContext";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// Use safe wrappers for dynamic client-only widgets
import { HomeMarqueeWidget, QuickViewWidget, WhatsAppWidget } from "@/components/DynamicWidgets";


export const crimson = Crimson_Text({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-crimson',
});

export const cinzel = Cinzel({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cinzel",
});

export const futura = localFont({
  src: "../public/fonts/Futura.ttf",
  display: "swap",
  variable: "--font-futura",
});

export const metadata = {
  metadataBase: new URL("https://www.ravenfragrance.in"),

  title: {
    default: "Raven Fragrance | Long-Lasting Perfumes for Men & Women",
    template: "%s | Raven Fragrance",
  },

  description:
    "Luxury long-lasting perfumes crafted with high concentration oils. Elegant packaging. Free delivery across India.",

  keywords: [
    "luxury perfumes India",
    "long lasting perfumes",
    "premium fragrance online",
    "perfume for men and women",
    "Raven Fragrance",
  ],

  alternates: {
    canonical: "https://www.ravenfragrance.in",
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },


  openGraph: {
    type: "website",
    url: "https://www.ravenfragrance.in",
    title: "Raven Fragrance | Long-Lasting Perfumes for Men & Women",
    description:
      "Luxury long-lasting perfumes crafted with high concentration oils. Elegant packaging. Free delivery across India.",
    siteName: "Raven Fragrance",
    locale: "en_IN",
    images: [
      {
        url: "/Ravenfragrance.jpg", // 🔥 Recommended instead of logo
        width: 1200,
        height: 630,
        alt: "Raven Fragrance Luxury Perfumes",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Raven Fragrance | Premium Long-Lasting Perfumes",
    description:
      "Luxury long-lasting perfumes crafted with high concentration oils.",
    images: ["/Ravenfragrance.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};


export default function RootLayout({ children }) {
  const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Raven Fragrance",
  url: "https://www.ravenfragrance.in",
  logo: "https://www.ravenfragrance.in/IMG_9377.PNG",
  sameAs: [
    "https://www.instagram.com/ravenfragrance.in/",
    "https://www.facebook.com/Ravenfragrance"
  ],
};
  return (
    <html lang="en" >
      <head>
        {/* LCP Preloads for fast image discovery */}
        <link rel="preload" as="image" href="/hero-desktop-light.PNG" media="(min-width: 768px)" fetchPriority="high" />
        <link rel="preload" as="image" href="/hero-mobile-light.PNG" media="(max-width: 767px)" fetchPriority="high" />

        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              strategy="lazyOnload"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <Script id="ga-init" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>

      <body className={`${crimson.variable} ${cinzel.variable} ${futura.variable} antialiased`}>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(organizationJsonLd),
            }}
          />
      <ThemeProvider>
        <Providers>
          <QuickViewProvider>
            <HomeMarqueeWidget />
            <NavBar />

            <div className="pt-12">{children}</div>

            <QuickViewWidget />

            <Footer />
            <WhatsAppWidget />

            <SpeedInsights />
            <Analytics />
          </QuickViewProvider>
         </Providers>
      </ThemeProvider>  
      </body>
    </html>
  );
}
