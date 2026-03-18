import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import HeroSection from "@/components/HeroSection";
import RavenBadge from '@/components/RavenBadge';
import ProductCarousel from "@/components/ProductCarousel";
import WhyChooseRaven from '@/components/WhyChooseRaven';
import HomeBottomFold from "@/components/HomeBottomFold";
import ScrollReveal from "@/components/ScrollReveal";

export default async function Home() {
  
  // ✅ Connect to DB (server component allowed)
  await connectToDatabase();

  // ✅ Fetch products dynamically
  const rawProducts = await Product.find({ deleted: { $ne: true } }).lean();

  // Convert ObjectId + dates → strings (Next.js requirement)
  const products = JSON.parse(JSON.stringify(rawProducts));

  // ⭐⭐⭐ ADD BESTSELLER & TOP-RATING LOGIC ⭐⭐⭐
  const bestsellerIds = products
    .filter((p) => p.rating && p.reviewCount) // only rated products
    .sort(
      (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount
    )
    .slice(0, 3) // top 3
    .map((p) => p._id);

  return (
    <div className="homepage-theme" >
      {/* HERO SECTION */}
      <HeroSection products={products.slice(0, 5)} />

      {/* REVEALING SECTIONS */}
      <ScrollReveal>
        <RavenBadge />
      </ScrollReveal>

      <ScrollReveal>
        <ProductCarousel products={products} bestsellerIds={bestsellerIds} />
      </ScrollReveal>

      <ScrollReveal>
        <WhyChooseRaven />
      </ScrollReveal>

      {/* OFF-SCREEN LAZY SECTIONS */}
      <HomeBottomFold />
    </div>
  );
}
