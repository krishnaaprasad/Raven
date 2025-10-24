import { Suspense } from "react";
import OrderSuccess from "./OrderSuccess";
import Head from "next/head";

export const metadata = {
  title: "Order Successful - Raven Fragrance",
  description:
    "Thank you for your purchase at Raven Fragrance. Your payment was successful and your order has been placed securely.",
  openGraph: {
    title: "Order Successful - Raven Fragrance",
    description:
      "Your payment was successful — Raven Fragrance thanks you for your order.",
    url: "https://www.ravenfragrance.in/order-success",
    siteName: "Raven Fragrance",
    images: [
      {
        url: "https://www.ravenfragrance.in/og-banner.jpg", // 👈 replace if you have a custom OG image
        width: 1200,
        height: 630,
        alt: "Raven Fragrance - Premium Perfumes",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Order Successful - Raven Fragrance",
    description:
      "Your payment was successful — Raven Fragrance thanks you for your order.",
    images: ["https://www.ravenfragrance.in/og-banner.jpg"],
  },
};

export default function OrderSuccessPage() {
  return (
    <>
      {/* ✅ For runtime fallback during client rendering */}
      <Head>
        <title>Order Successful - Raven Fragrance</title>
        <meta
          name="description"
          content="Thank you for your purchase at Raven Fragrance. Your payment was successful and your order has been placed securely."
        />
      </Head>

      <Suspense
        fallback={
          <div className="text-center py-20 text-lg text-[#6B4B1E] animate-pulse">
            Processing your order...
          </div>
        }
      >
        <OrderSuccess />
      </Suspense>
    </>
  );
}
