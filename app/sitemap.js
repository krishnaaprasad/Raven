import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function sitemap() {
  const baseUrl = "https://www.ravenfragrance.in";

  await connectToDatabase();

  const products = await Product.find({ deleted: { $ne: true } })
    .select("slug updatedAt")
    .lean();

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.updatedAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/collection`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...productUrls,
  ];
}