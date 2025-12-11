import Marquee from "react-fast-marquee";
import NavBar from '@/components/NavBar';
import ScentStorySection from "@/components/ScentStorySection";
import AboutRaven from '@/components/AboutRaven';
import WhyChooseRaven from '@/components/WhyChooseRaven';
import RebelSpirit from '@/components/RebelSpirit';
import RebelFinale from '@/components/RebelFinale';
import RavenBadge from '@/components/RavenBadge';
import ProductCarousel from "@/components/ProductCarousel";

import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function Home() {

  // ✅ Connect to DB (server component allowed)
  await connectToDatabase();

  // ✅ Fetch products dynamically
  const rawProducts = await Product.find({ deleted: false }).lean();

  // Convert ObjectId + dates → strings (Next.js requirement)
  const products = JSON.parse(JSON.stringify(rawProducts));

  return (
    <div className="homepage-theme">

      {/* HERO VIDEO */}
      <section className="relative w-full min-h-80 sm:min-h-[340px] md:min-h-[550px] flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-[50%_20%] md:object-center"
        >
          <source src="/intro.mp4" type="video/mp4" />
        </video>
      </section>

      {/* GOLD DIVIDER */}
      <div className="w-full h-0.5 bg-linear-to-r from-[#af9b64] via-[#B4933A] to-[#af9b64] shadow-md" />

      {/* SECTIONS */}
      <RavenBadge />
      <ProductCarousel products={products} />
      <WhyChooseRaven />

      {/*
      <AboutRaven />
      <RebelSpirit />
      <RebelFinale />
      <ScentStorySection />
      */}
    </div>
  );
}
