"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600"],
  style: ["italic"],
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
});


export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  /* ⭐ PRODUCT SLIDER STATE */
  const [products, setProducts] = useState([]);
  const intervalRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef(null);
  const heroLifestyleBg = "/hero-bg.jpg"; // place in /public
  const [screen, setScreen] = useState("desktop");

useEffect(() => {
  const update = () => {
    const w = window.innerWidth;
    if (w < 640) setScreen("mobile");
    else if (w < 1024) setScreen("tablet");
    else setScreen("desktop");
  };

  update();
  window.addEventListener("resize", update);
  return () => window.removeEventListener("resize", update);
}, []);

const bgConfig = {
  mobile: { position: "100% 105%" },
  tablet: { position: "75% 55%" },
  desktop: { position: "-10% 0%" },
};


  useEffect(() => {
    setIsVisible(true);
  }, []);

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products?limit=5", { cache: "force-cache" })
        const data = await res.json();
        setProducts(data || []);
      } catch (err) {
        console.error("Hero products error", err);
      }
    }
    loadProducts();
  }, []);


const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    setMousePosition({ x: x * 20, y: y * 20 });
  };

/* ================= ANIMATION VARIANTS ================= */
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? -120 : 120,
      opacity: 0,
    }),
  };

  return (
    <section
  onMouseMove={handleMouseMove}
  className="relative w-full min-h-screen overflow-hidden -mt-[50px] pt-0"
>
  {/* ===== LOVABLE STYLE MULTI-LAYER PARALLAX BACKGROUND ===== */}
<div className="absolute inset-0 perspective-distant -z-10 overflow-hidden">
  {/* Layer 1 — main lifestyle image */}
 <div className="absolute inset-0 -z-10 overflow-hidden">
  <Image
    src={heroLifestyleBg}
    alt="Hero background"
    fill
    priority
    className="object-cover transition-transform duration-500 ease-out will-change-transform"
    style={{
      objectPosition: bgConfig[screen]?.position || "center",
      transform:
        screen === "desktop"
          ? `translate3d(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px, 0) scale(1.08)`
          : "scale(1.05)", // ⭐ SAME on first paint
    }}
  />
</div>


  {/* Layer 3 — subtle light beams */}
  <div
    className="absolute fill inset-0 overflow-hidden transition-transform duration-300 ease-out"
    style={{
      transform: `translate3d(${mousePosition.x * 0.2}px, ${mousePosition.y * 0.2}px, -25px)`,
    }}
  >
    <div className="absolute top-0 left-[15%] w-[120px] h-[70%] bg-linear-to-b from-[#b28c34]/10 via-[#b28c34]/5 to-transparent rotate-12 blur-2xl animate-pulse" />
    <div className="absolute top-0 right-[20%] w-[100px] h-[60%] bg-linear-to-b from-[#fcfbf8]/15 via-[#fcfbf8]/5 to-transparent -rotate-10 blur-2xl animate-pulse [animation-delay:1.5s]" />
  </div>

  {/* Readability overlays */}
  <div className="absolute inset-0 bg-linear-to-r from-[#1b180d]/70 via-[#1b180d]/40 to-transparent" />
  <div className="absolute inset-0 bg-linear-to-b from-[#1b180d]/25 via-transparent to-transparent h-32" />
<div className="absolute inset-0 bg-linear-to-t from-[#1b180d]/30 via-transparent to-transparent" />

</div>

{/* Floating bokeh particles */}
<div
  className="absolute inset-0 pointer-events-none overflow-hidden z-2 transition-transform duration-200"
  style={{
    transform: `translate3d(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px, 50px)`,
  }}
>
  <div className="absolute w-32 h-32 rounded-full bg-linear-to-br from-[#b28c34]/25 to-transparent blur-2xl animate-float" style={{ top: "20%", left: "10%" }} />
  <div className="absolute w-48 h-48 rounded-full bg-linear-to-br from-[#fcfbf8]/20 to-transparent blur-3xl animate-float [animation-delay:2s]" style={{ top: "55%", right: "5%" }} />
  <div className="absolute w-24 h-24 rounded-full bg-linear-to-br from-[#b28c34]/30 to-transparent blur-xl animate-float [animation-delay:4s]" style={{ top: "70%", left: "30%" }} />
</div>

      {/* ================= DECORATIVE BACKGROUND ================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[#b28c34]/5 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-[#b28c34]/6 blur-3xl animate-float [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-[#b28c34]/4 blur-2xl animate-float [animation-delay:4s]" />

  {/* Overlay to keep it elegant & readable */}
  <div className="absolute inset-0 bg-linear-to-br from-[#b28c34]/30 via-[#1b180d]/20 to-[#1b180d]/40" />
</div>


        {/* GRID */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.02]">
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-[#1b180d]"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
    

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 min-h-screen pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center min-h-screen py-13">

          {/* ================= LEFT ================= */}
          <div
            className={`order-2 lg:order-1 text-center lg:text-left transition-all duration-1000
           p-6 sm:p-10 lg:p-0
            ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            {/* TAG */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/20 mb-6 transition-all duration-700 delay-200 ${
                isVisible ? "opacity-100" : "opacity-0 translate-y-4"
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#ecb023] " />
              <span
                className={`text-xs sm:text-sm uppercase tracking-[0.2em] text-[#ecb023] leading-5 ${outfit.className}`}
                >
                Premium Artisan Fragrances
                </span>
            </div>

            {/* TITLE */}
            <h1 className="font-serif text-7xl sm:text-8xl xl:text-8xl text-white leading-tight mb-6">
              Unveil
              <span
                className={`block italic sm:text-8xl text-7xl font-bold relative mt-0 text-gold-gradient bg-clip-text ${cormorant.className}`}>
                Your Essence
                <svg
                  className="absolute -bottom-2 left-0 w-full max-w-[300px]"
                  viewBox="0 0 300 12"
                >
                  <path
                    d="M0 6 Q75 0, 150 6 T300 6"
                    fill="none"
                    stroke="#b28c34"
                    strokeWidth="2"
                    opacity="0.6"
                  />
                </svg>
              </span>
            </h1>

            {/* DESCRIPTION */}
            <p className="text-white/80 max-w-md mx-auto lg:mx-0 text-lg mb-8 font-[Manrope,sans-serif]">
              Discover fragrances that reveal, not mask. Each note crafted with rare botanicals to create{" "}
              <span className="text-[#ecb023] font-medium">a scent uniquely yours</span>.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">

  {/* PRIMARY CTA */}
  <Link href="/collection">
    <button className="group relative px-10 py-4 rounded-full bg-[#b68615] text-white font-semibold shadow-xl overflow-hidden cursor-pointer">
      <span className="relative z-10 flex text-base sm:text-xl items-center gap-2">
        Explore Collection
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
      </span>
      <span className="absolute inset-0 bg-linear-to-r from-[#9a864c] to-[#b28c34] opacity-0 group-hover:opacity-100 transition" />
    </button>
  </Link>

  <button
  onClick={() => {
    const el = document.getElementById("why-choose-raven");
    el?.scrollIntoView({ behavior: "smooth" });
  }}
  className="
    inline-flex
    w-fit
    self-center sm:self-auto
    px-8
    py-4
    rounded-full
    border border-white/30
    text-white
   hover:bg-[#fcfbf8] hover:border-[#b28c34]
    hover:text-[#1b180d]
    transition-all duration-300
    text-sm sm:text-base
    font-medium
    max-w-fit
  "
>
  Our Story
</button>


</div>


            {/* TRUST */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 mt-8 pt-6 border-t border-white/20">
              {[
                { value: "100%", label: "Natural" },
                { value: "20+", label: "Ingredients" },
                { value: "500+", label: "Customers" },
              ].map((b) => (
                <div key={b.label}>
                  <div className="text-xl sm:text-3xl font-serif text-[#b28c34]">{b.value}</div>
                  <div className="text-xs sm:text-sm tracking-widest text-white/70 uppercase">
                    {b.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= RIGHT ================= */}
          <div
            className={`order-1 lg:order-2 relative transition-all duration-1000 ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
>

            <div className="absolute -inset-6 border border-[#b28c34]/20 rounded-3xl -rotate-3" />
            <div className="absolute -inset-4 border border-[#b28c34]/10 rounded-3xl rotate-2" />
            
            <div className="
  relative
  aspect-3/4
  max-w-md
  mx-auto
  rounded-2xl
  min-h-[70vh]
  sm:min-h-0
">
  {products.length === 0 && (
    <div className="absolute inset-0 bg-[#f3f1ea] rounded-2xl animate-pulse" />
  )}
            <Swiper
            key="hero-swiper"
              modules={[Autoplay]}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
              }}
              loop
              grabCursor
              slidesPerView={1}
              className="
                relative
                aspect-3/4
                sm:aspect-3/4
                max-w-md
                mx-auto
                rounded-2xl
                shadow-2xl
                min-h-[70vh]     // ⭐ mobile height boost
                sm:min-h-0
              "
            >
  {products.map((product) => (
    <SwiperSlide key={product._id}>
      <Link href={`/product/${product.slug}`}>
        <div
          className="relative h-full rounded-2xl overflow-hidden border border-[#b28c34]/20 shadow-2xl cursor-pointer"
          style={{
            transform:
              screen === "desktop"
                ? `perspective(1000px) rotateY(${mousePosition.x * 0.4}deg) rotateX(${-mousePosition.y * 0.4}deg)`
                : "none", // ⭐ disable on mobile/tablet
          }}
        >
          {/* IMAGE */}
          <Image
            src={product.images?.[0]?.original || "/placeholder.jpg"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 95vw, 500px"
            className="object-cover transition-transform duration-700"
            priority={true}              // ⭐ IMPORTANT
            fetchPriority="high"         // ⭐ LCP hint
          />

          {/* OVERLAY */}
          <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />

          {/* PRODUCT CARD */}
          <div className="absolute bottom-5 left-5 right-5 bg-[#fcfbf8]/85 backdrop-blur rounded-xl p-3 border border-[#b28c34]/20">
            <p className={`text-lg text-[#1b180d] ${cormorant.className}`}>
              {product.name}
            </p>

            <div className="flex justify-between items-end mt-2">
              <div>
                <p className="text-sm line-through text-[#5f544e]">
                  ₹{product.variants?.[0]?.mrp}
                </p>
                <p className="text-xl font-semibold text-[#b28c34]">
                  ₹{product.variants?.[0]?.price}
                </p>
              </div>

              <span
                className={`text-xs uppercase tracking-widest text-[#b28c34] ${outfit.className}`}
              >
                Shop Now ➜
              </span>
            </div>
          </div>
        </div>
      </Link>
    </SwiperSlide>
  ))}
</Swiper>


      {/* SCROLL INDICATOR */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        <span className="text-xs uppercase tracking-widest text-[#5f544e] hidden sm:block">
          Discover More
        </span>
        <div className="w-6 h-10 border-2 border-[#1b180d]/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-[#b28c34] rounded-full animate-bounce" />
        </div>
      </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
