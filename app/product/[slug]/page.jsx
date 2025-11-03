import ProductClient from "./ProductClient";

export async function generateMetadata({ params }) {
  const { slug } = await params; // ✅ await here

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${slug}`, {
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
  const { slug } = await params; // ✅ also await here
  return <ProductClient slug={slug} />;
}
