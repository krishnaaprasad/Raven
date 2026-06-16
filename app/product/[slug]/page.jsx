import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductClient from "./ProductClient";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://www.ravenfragrance.in");

  try {
    await connectToDatabase();
    const product = await Product.findOne({
      slug,
      deleted: { $ne: true },
    }).lean();

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
  return <ProductClient slug={slug} />;
}
