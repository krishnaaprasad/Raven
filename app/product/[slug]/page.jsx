import ProductClient from "./ProductClient";

export async function generateMetadata({ params }) {
  const { slug } = params;

  const baseUrl =
    process.env.BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  try {
    const res = await fetch(`${baseUrl}/api/products/${slug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error("Failed to fetch product");
    const product = await res.json();

    return {
      title: `${product.name} - Raven Fragrance`,
      description:
        product.metaDescription ||
        product.shortDescription ||
        "Discover premium perfumes from Raven Fragrance.",
      openGraph: {
        title: `${product.name} - Raven Fragrance`,
        description: product.metaDescription || product.shortDescription,
        images: product.images?.[0]
          ? [{ url: product.images[0].original || product.images[0] }]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} - Raven Fragrance`,
        description: product.metaDescription || product.shortDescription,
        images: product.images?.[0]
          ? [{ url: product.images[0].original || product.images[0] }]
          : [],
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
  const { slug } = params;
  return <ProductClient slug={slug} />;
}
