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
   
    {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-[#F9F6F1] via-[#FFF9E7] to-[#E3C987]">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center py-16 md:py-24 gap-8">

    {/* TEXT CONTENT */}
    <div className="w-full md:w-1/2 text-center md:text-left">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight font-[Montserrat] text-[#191919] mb-3">
        The Signature of Sophistication
      </h1>
      <div className="mx-auto md:mx-0 h-[2.5px] w-20 mb-4 bg-gradient-to-r from-[#B4933A] to-[#FFE186] rounded-full"></div>
      <p className="text-base sm:text-lg text-[#9F885B] mb-7 font-medium max-w-md mx-auto md:mx-0">
        Raven Fragrance — Inspired luxury. Crafted for those who appreciate the extraordinary.
      </p>
      <button className="inline-block px-7 py-3 text-base bg-black text-[#F6E9C0] font-semibold rounded-full shadow-lg hover:bg-[#232020] transition">
        Shop Now
      </button>
    </div>

    {/* IMAGE */}
    <div className="w-full md:w-1/2 flex justify-center items-center">
      <img
        src="/perfume raven.PNG" // Adjust path as needed
        alt="Raven Fragrance Perfume Bottle"
        className="max-w-[230px] sm:max-w-[270px] md:max-w-[340px] w-full h-auto rounded-2xl shadow-xl object-contain bg-transparent"
        draggable="false"
      />
    </div>
  </div>
</section>
<div className="w-full h-[2px] bg-gradient-to-r from-[#af9b64] via-[#B4933A] to-[#af9b64] shadow-md" />
  
  <FindYourScentSection />
  <ScentStorySection />
  </>

  );
}

