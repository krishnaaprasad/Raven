import Marquee from "react-fast-marquee";
import ScentStorySection from "@/components/ScentStorySection";
import AboutRaven from '@/components/AboutRaven';
import WhyChooseRaven from '@/components/WhyChooseRaven';
import RebelSpirit from '@/components/RebelSpirit';
import RebelFinale from '@/components/RebelFinale';
import RavenBadge from '@/components/RavenBadge';
import ProductCarousel from "@/components/ProductCarousel";
import InstagramGallery from "@/components/InstagramGallery";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import HeroSection from "@/components/HeroSection";
import Testimonials from "@/components/Testimonial";
import FAQSection from '@/components/FAQSection';
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

      {/* HERO VIDEO */}
      <HeroSection products={products.slice(0, 5)} />
      {/* SECTIONS */}
      <RavenBadge />
      {/* ⭐ PASS bestsellerIds ALSO ⭐ */}
      <ProductCarousel products={products} bestsellerIds={bestsellerIds} />
      <WhyChooseRaven />
      <FAQSection />
      <Testimonials />
      <InstagramGallery /> 

      {/*
      <AboutRaven />
      <RebelSpirit />
      <RebelFinale />
      <ScentStorySection />
      */}
    </div>
  );
}
