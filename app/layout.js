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
import Script from "next/script";
import { ThemeProvider } from "./theme-provider";
import { Crimson_Text } from 'next/font/google';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const crimson = Crimson_Text({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://www.ravenfragrance.in"),

  title: {
    default: "Raven Fragrance - Premium Long-Lasting Perfumes",
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
    title: "Raven Fragrance - Premium Long-Lasting Perfumes",
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
    title: "Raven Fragrance - Premium Long-Lasting Perfumes",
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
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(organizationJsonLd),
            }}
          />
      <ThemeProvider>
        <Providers>
          <QuickViewProvider>
            <HomeMarquee />
            <NavBar />

            <div className="pt-12">{children}</div>

            <QuickViewModal />

            <Footer />
            <WhatsAppButton />

            <SpeedInsights />
            <Analytics />
          </QuickViewProvider>
         </Providers>
      </ThemeProvider>  
      </body>
    </html>
  );
}
