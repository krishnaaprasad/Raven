import Marquee from "react-fast-marquee";
import NavBar from '@/components/NavBar';
import ScentStorySection from "@/components/ScentStorySection";
import ProductBanner from '@/components/ProductBanner';
import AboutRaven from '@/components/AboutRaven';
import WhyChooseRaven  from '@/components/WhyChooseRaven';
import RebelSpirit  from '@/components/RebelSpirit';
import RebelFinale from '@/components/RebelFinale';
import RavenBadge from '@/components/RavenBadge'

import FindYourScentSection from "@/components/FindYourScentSection";

export default function Home() {
  return (
    <>
    <div className="bg-black text-white text-sm py-2">
     <Marquee
      pauseOnHover={true}
      pauseOnClick={true}
      gradient={true}
      gradientColor={[248, 251, 253]}
      gradientWidth={200}
      speed={60}
    >
      🔥 20% OFF on all perfumes today! &nbsp;&nbsp;&nbsp;
      🚚 Free shipping on orders over ₹999! &nbsp;&nbsp;&nbsp;
      🎁 Buy 1 Get 1 Free on selected items!
    </Marquee></div>
   
 <section className="relative w-full min-h-[320px] sm:min-h-[340px] md:min-h-[550px] flex items-center justify-center overflow-hidden">
  <video
    autoPlay
    loop
    muted
    playsInline
    className="absolute inset-0 w-full h-full object-cover object-[50%_20%] md:object-center"
    poster=""
  >
    <source src="/intro.mp4" type="video/mp4" />
  </video>
  
</section>

<div className="w-full h-[2px] bg-gradient-to-r from-[#af9b64] via-[#B4933A] to-[#af9b64] shadow-md" />
  <RavenBadge />
  <AboutRaven />
  <WhyChooseRaven />
  <RebelSpirit />
  <RebelFinale />
  <ScentStorySection />
  
  
  
  </>

  );
}

