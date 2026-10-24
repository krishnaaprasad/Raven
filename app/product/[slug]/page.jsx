import { cache } from "react";
import { notFound } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import { PUBLIC_PRODUCT_FIELDS } from "@/lib/publicProduct";
import ProductClient from "./ProductClient";

// Cache rendered product pages; refresh every 60s so price/stock edits show up quickly
export const revalidate = 60;

// One DB query shared by generateMetadata and the page
const getProduct = cache(async (slug) => {
  await connectToDatabase();
  const product = await Product.findOne({ slug, deleted: { $ne: true } })
    .select(PUBLIC_PRODUCT_FIELDS)
    .lean();
  return product ? JSON.parse(JSON.stringify(product)) : null;
});

export async function generateStaticParams() {
  try {
    await connectToDatabase();
    const products = await Product.find({ deleted: { $ne: true } }).select("slug").lean();
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://www.ravenfragrance.in");

  try {
    const product = await getProduct(slug);

    if (!product) throw new Error("Failed to fetch product");

    const image =
      product.images?.[0]?.original ||
      product.images?.[0] ||
      "/Ravenfragrance.jpg";

    // 🔥 Make image absolute
    const absoluteImage = image.startsWith("http")
      ? image
      : `${baseUrl}${image}`;

    const productUrl = `${baseUrl}/product/${product.slug}`;

    return {
      title: `${product.name} | Raven Fragrance`,
      description:
        product.metaDescription ||
        product.shortDescription ||
        "Discover premium perfumes from Raven Fragrance.",

      alternates: {
        canonical: productUrl,
      },

      openGraph: {
        type: "website",
        url: productUrl,
        title: `${product.name} | Raven Fragrance`,
        description:
          product.metaDescription ||
          product.shortDescription,
        images: [
          {
            url: absoluteImage,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
      },

      twitter: {
        card: "summary_large_image",
        title: `${product.name} | Raven Fragrance`,
        description:
          product.metaDescription ||
          product.shortDescription,
        images: [absoluteImage],
      },
    };
  } catch (error) {
    console.error("Metadata fetch error:", error);

    return {
      title: "Raven Fragrance",
      description: "Premium fragrances crafted for the modern rebel.",
    };
  }
}

export default async function Page({ params }) {
  const { slug } = await params;
  let product = null;
  let failed = false;
  try {
    product = await getProduct(slug);
  } catch (error) {
    failed = true;
    console.error("Product fetch error:", error);
  }
  // Real 404 for removed/unknown products (DB errors still fall back to the client fetch)
  if (!product && !failed) notFound();
  return <ProductClient slug={slug} initialProduct={product} />;
}
