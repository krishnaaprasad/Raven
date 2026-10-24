import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import { PUBLIC_PRODUCT_FIELDS } from "@/lib/publicProduct";
import HeroSection from "@/components/HeroSection";
import RavenBadge from '@/components/RavenBadge';
import ProductCarousel from "@/components/ProductCarousel";
import WhyChooseRaven from '@/components/WhyChooseRaven';
import HomeBottomFold from "@/components/HomeBottomFold";
import ScrollReveal from "@/components/ScrollReveal";

// Refresh product data every 60s (previously frozen at build time until the next deploy)
export const revalidate = 60;

export const metadata = {
  alternates: { canonical: "https://www.ravenfragrance.in" },
};

export default async function Home() {
  
  // ✅ Connect to DB (server component allowed)
  await connectToDatabase();

  // ✅ Fetch products dynamically
  const rawProducts = await Product.find({ deleted: { $ne: true } })
    .select(PUBLIC_PRODUCT_FIELDS)
    .lean();

  // Convert ObjectId + dates → strings (Next.js requirement)
  const products = JSON.parse(JSON.stringify(rawProducts));


  return (
    <div className="homepage-theme" >
      {/* HERO SECTION */}
      <HeroSection />

      {/* REVEALING SECTIONS */}
      <ScrollReveal>
        <RavenBadge />
      </ScrollReveal>

      <ScrollReveal>
        <ProductCarousel products={products} />
      </ScrollReveal>

      <ScrollReveal>
        <WhyChooseRaven />
      </ScrollReveal>

      {/* OFF-SCREEN LAZY SECTIONS */}
      <HomeBottomFold />
    </div>
  );
}
