import NavBar from '@/components/NavBar';
import ScentStorySection from "@/components/ScentStorySection";

import FindYourScentSection from "@/components/FindYourScentSection";

export default function Home() {
  return (
    <>
    {/* 🟡 Offer strip visible only on homepage */}
      <div className="relative bg-black overflow-hidden py-2">
  <div className="marquee-single text-white text-sm whitespace-nowrap px-5 font-medium">
    🔥 20% OFF on all perfumes today!   🚚 Free shipping on orders over ₹999!   🎁 Buy 1 Get 1 Free on selected items!
  </div>
</div>
   
 <section className="relative w-full min-h-[340px] sm:min-h-[380px] md:min-h-[550px] flex items-center justify-center overflow-hidden">
  <video
    autoPlay
    loop
    muted
    playsInline
    className="absolute inset-0 w-full h-full object-cover object-[50%_20%] md:object-center"
    poster="/perfume-banner-fallback.jpg"
  >
    <source src="/intro.mp4" type="video/mp4" />
  </video>
  
</section>

<div className="w-full h-[2px] bg-gradient-to-r from-[#af9b64] via-[#B4933A] to-[#af9b64] shadow-md" />
  
  <FindYourScentSection />
  <ScentStorySection />
  </>

  );
}

