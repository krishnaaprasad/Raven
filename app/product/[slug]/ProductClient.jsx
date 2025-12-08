'use client'

import { ChevronDown, ChevronUp } from "lucide-react";
import Zoom from "react-medium-image-zoom";
import ZoomPlugin from "yet-another-react-lightbox/plugins/zoom";

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { FaCheck, FaShoppingCart } from 'react-icons/fa'
import ProductReviews from "@/components/ProductReviews";

// ✅ Swiper setup
import SwiperCore from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Thumbs, Pagination } from 'swiper/modules'
SwiperCore.use([Thumbs, Pagination])

import 'swiper/css'
import 'swiper/css/thumbs'
import 'swiper/css/pagination'

import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from '@/app/context/cartcontext'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function ProductClient({ slug }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [thumbsSwiper, setThumbsSwiper] = useState(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [isAdding, setIsAdding] = useState(false)
  const [reviewSummary, setReviewSummary] = useState({ avg: 0, total: 0 });
  const [activeTab, setActiveTab] = useState("");


  // Accordion: Description / Ingredients / How To Use
  const [openSections, setOpenSections] = useState({
    Description: true,
    ProductDetails: false,
    HowToUse: false,
  });

  const { addToCart } = useCart()
  const router = useRouter()

  const toggleSection = (tab) =>
    setOpenSections((prev) => ({ ...prev, [tab]: !prev[tab] }))

  // ─────────────────────────
  // Fetch product
  // ─────────────────────────
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${slug}`)
        const data = await res.json()

        if (res.ok && data) {
          setProduct(data)
          setSelected(data.variants?.[0])
        } else {
          router.replace("/")
          toast.error("This product is no longer available")
        }
      } catch (error) {
        router.replace("/")
        toast.error("This product is unavailable")
        console.error("Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }

    if (slug) fetchProduct()
  }, [slug, router])

  // ─────────────────────────
  // Skeleton while loading / missing
  // ─────────────────────────
  if (!product || !selected) {
    return (
      <section className="min-h-screen bg-[#FCF8F3] py-12 flex justify-center">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 animate-pulse">
        </div>
      </section>
    );
  }

  // ─────────────────────────
  // Helpers
  // ─────────────────────────
  const increase = () => setQuantity((q) => q + 1)
  const decrease = () => setQuantity((q) => (q > 1 ? q - 1 : 1))

  const handleAddToCart = () => {
    setIsAdding(true)

    const imageUrl = Array.isArray(product.images)
      ? product.images[0]?.original || product.images[0]
      : product.image || ''

    addToCart(
      {
        id: product._id,
        name: product.name,
        slug: product.slug,
        price: selected.price,
        image: imageUrl,
        size: selected.size,
      },
      quantity
    )

    toast.success(`${product.name} (${selected.size}) added to cart!`)
    setTimeout(() => setIsAdding(false), 800)
  }

  const handleBuyNow = () => {
    const buyNowItem = {
      id: product._id,
      name: product.name,
      slug: product.slug,
      price: selected.price,
      mrp: selected.mrp,
      image: Array.isArray(product.images)
        ? product.images[0]?.original || product.images[0]
        : product.image || '',
      size: selected.size,
      quantity,
    }

    sessionStorage.setItem("buyNowItem", JSON.stringify(buyNowItem))
    router.push('/checkout?mode=buynow')
  }

  // Scroll to Reviews & open Review section
  const scrollToReviews = () => {
    const section = document.getElementById("reviews-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });

      // Auto-open/activate Review area
      setActiveTab("Review");
      setOpenSections((prev) => ({ ...prev, Review: true }));
    }
  };

  const formatAmount = (value) => {
    if (!value || isNaN(value)) return "0.00"
    return Number(value).toFixed(2)
  }

  const subtotal = selected.price * quantity

  // Rating summary (Style A)
  const hasRatingSummary =
    typeof product.averageRating === "number" &&
    typeof product.reviewCount === "number"

  // ─────────────────────────
  // UI
  // ─────────────────────────
  return (
    <section className="min-h-screen bg-[#FCF8F3] py-8 px-4 sm:px-8">
      {/* Top 2-column layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] gap-10 md:gap-16 items-start">
      {/* DESKTOP GALLERY STICKY WRAPPER */}
      <div className="hidden md:block sticky top-18 h-fit self-start">
        <div className="flex gap-4">
          {/* Left Thumbnails */}
          <div className="flex flex-col gap-3 w-24 max-h-[80vh] overflow-y-auto custom-scroll">
            {product.images.map((src, index) => {
              const thumb = src?.thumbnail || src;
              return (
                <div
                  key={index}
                  onClick={() => setLightboxIndex(index)}
                  className={`border rounded-lg overflow-hidden cursor-pointer transition ${
                    lightboxIndex === index ? "border-[#b28c34]" : "border-gray-300"
                  }`}
                >
                  <Image
                    src={thumb}
                    alt={`${product.name} thumbnail`}
                    width={95}
                    height={95}
                    className="object-cover w-full h-[95px]"
                  />
                </div>
              );
            })}
          </div>

          {/* Main Image */}
          <div className="flex-1 items-center justify-center">
            <Image
              src={product.images[lightboxIndex]?.original || product.images[lightboxIndex]}
              alt={product.name}
              width={600}
              height={600}
              className="object-contain rounded-xl cursor-pointer"
              onClick={() => setLightboxOpen(true)}
            />
          </div>
        </div>
      </div>


      {/* MOBILE GALLERY WITH THUMBNAILS */}
      <div className="md:hidden">
        {/* Main Swiper */}
        <Swiper
          spaceBetween={10}
          pagination={{ clickable: true }}
          thumbs={{ swiper: thumbsSwiper }}
          modules={[Thumbs, Pagination]}
          className="rounded-xl mb-3"
        >
          {product.images?.map((src, i) => (
            <SwiperSlide key={i}>
              <Image
                src={src?.original || src}
                alt={product.name}
                width={400}
                height={400}
                className="w-full h-auto object-contain rounded-xl cursor-pointer"
                onClick={() => {
                  setLightboxIndex(i);
                  setLightboxOpen(true);
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Mobile Thumbnails */}
        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={12}
          slidesPerView={4}
          freeMode
          watchSlidesProgress
          className="mt-4"
        >
          {product.images?.map((src, i) => (
            <SwiperSlide key={i}>
              <Image
                src={src?.thumbnail || src}
                alt={`thumb-${i}`}
                width={80}
                height={80}
                className="rounded-lg border border-gray-300 object-cover h-[85px] w-[85px] cursor-pointer "
                onClick={() => setLightboxIndex(i)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

        {/* RIGHT: Product Details + Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4 w-full max-w-xl mx-auto"
        >
          {/* Title */}
          <h1 className="font-serif font-druzhba text-3xl sm:text-4xl text-[#1E140B] leading-tight">
            {product.name}
          </h1>

          {/* Tagline */}
          <p className="text-[#755B00] text-base md:text-lg font-medium">
            Long lasting | Premium scent | Fragrance
          </p>

          {/* Rating summary - Style A */}
          {hasRatingSummary && (
            <div className="flex items-center gap-2 text-sm text-[#4B423C]">
              <span className="text-base">★ {product.averageRating.toFixed(1)}</span>
              <span className="text-xs text-[#6b6654]">
                | {product.reviewCount} {product.reviewCount === 1 ? "review" : "reviews"}
              </span>
            </div>
          )}
          
          {reviewSummary.total > 0 && (
            <div onClick={scrollToReviews}

              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#e7e1cf] bg-white hover:bg-[#faf6ed] transition cursor-pointer w-auto max-w-fit"
            >
              <span className="text-[#b28c34] text-[15px]">★</span>

              <span className="font-semibold text-[#1b180d] text-[15px]">
                {reviewSummary.avg}
              </span>

              <span className="text-[#b28c34]">|</span>

              <span className="text-[#b28c34] text-[15px]">✓</span>

              <span className="text-[#6b6654] text-[14px]">
                ({reviewSummary.total} reviews)
              </span>
            </div>
          )}

          {/* Price block */}
          <div>
            <p className="text-gray-700 text-sm font-semibold mb-1">
              MRP ₹{formatAmount(selected.mrp)} (Incl. of all taxes)
            </p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-extrabold text-[#B28C34]">
                ₹{formatAmount(selected.price)}
              </span>
              <span className="text-gray-400 line-through text-lg">
                ₹{formatAmount(selected.mrp)}
              </span>
            </div>
          </div>

          {/* Size selector */}
          <div>
            <p className="text-[#4B423C] font-semibold mb-2">
              Size: {selected.size}
            </p>
            <div className="flex flex-wrap gap-3">
              {product.variants?.map((v, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(v)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selected.size === v.size
                      ? 'bg-black text-white shadow'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {v.size.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Benefits */}
          {product.benefits?.length > 0 && (
            <div>
              <p className="font-bold mb-2 text-[#231F20] text-lg">
                What makes it great:
              </p>
              <ul className="space-y-2 text-[#5F544E] text-base">
                {product.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <FaCheck className="text-[#b28c34]" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-3 w-full">
            <div className="flex items-center border border-[#D0C5A3] rounded-full overflow-hidden bg-white">
              <button
                onClick={decrease}
                className="px-4 py-2 text-lg font-semibold text-[#917B2E]"
              >
                −
              </button>
              <span className="px-6 py-2 font-semibold">{quantity}</span>
              <button
                onClick={increase}
                className="px-4 py-2 text-lg font-semibold text-[#917B2E]"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="relative group flex-1 h-12 rounded-full overflow-hidden text-sm font-semibold tracking-wide uppercase text-[#1b180d] transition-all shadow-[0_4px_10px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_15px_rgba(0,0,0,0.15)] font-[Manrope,sans-serif] cursor-pointer"
              style={{
                background: 'linear-gradient(45deg, #a66d30, #ffe58e 50%, #e0b057)',
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isAdding ? 'Added!' : 'Add to Cart'}
                <FaShoppingCart size={16} />
              </span>

              <span className="absolute top-0 left-[-80%] w-[60%] h-full bg-linear-to-tr from-transparent via-white/50 to-transparent rotate-25 opacity-0 group-hover:opacity-100 animate-shine-slow"></span>
            </button>
          </div>

          {/* Buy Now Button */}
          <button
            onClick={handleBuyNow}
            className="relative flex-1 h-12 rounded-full bg-black text-white text-sm font-semibold uppercase tracking-wide transition-all hover:bg-[#111] flex flex-col justify-center font-[Manrope,sans-serif] cursor-pointer"
          >
            <div className="flex items-center justify-center gap-2">
              Buy Now
              <Image
                src="https://fastrr-boost-ui.pickrr.com/assets/images/boost_button/upi_options.svg"
                alt="UPI Options"
                width={50}
                height={10}
                className="ml-1 my-0.5"
              />
            </div>
            <p className="text-[7px] mt-1 items-right opacity-70 font-normal text-center">
              Powered by Cashfree
            </p>
          </button>

          {/* Shimmer keyframes for Add to Cart */}
          <style jsx>{`
            @keyframes shineSlow {
              0% {
                left: -80%;
                opacity: 0.9;
              }
              25% {
                opacity: 0.9;
              }
              50% {
                left: 120%;
                opacity: 0.6;
              }
              100% {
                left: 120%;
                opacity: 0;
              }
            }
            .animate-shine-slow {
              animation: shineSlow 4s ease-in-out infinite;
            }
          `}</style>

          {/* ─────────────────────────
              VERTICAL ACCORDION (RIGHT COLUMN)
              Description / Ingredients / How To Use
             ───────────────────────── */}
          {/* Accordion Section */}
          <div className="w-full max-w-xl mx-auto mt-10 border border-[#e7e1cf] rounded-lg overflow-hidden">
            {[
              { id: "Description", label: "DESCRIPTION" },
              { id: "ProductDetails", label: "PRODUCT DETAILS" },
              { id: "HowToUse", label: "HOW TO USE" },
            ].map((tab) => (
              <div key={tab.id} className="border-b last:border-b-0 border-[#e7e1cf]">
                <button
                  type="button"
                  onClick={() =>
                    setOpenSections((prev) => ({ ...prev, [tab.id]: !prev[tab.id] }))
                  }
                  className="w-full flex items-center justify-between py-4 px-4 font-medium tracking-wider text-base text-[#1b180d] uppercase"
                >
                  <span className="flex-1 text-center">{tab.label}</span>

                  <span className="text-[#1b180d]">
                    {openSections[tab.id] ? (
                      <ChevronUp size={20} strokeWidth={1.6} />
                    ) : (
                      <ChevronDown size={20} strokeWidth={1.6} />
                    )}
                  </span>
                </button>

            {/* Smooth open animation */}
            <AnimatePresence initial={false}>
              {openSections[tab.id] && (
                <motion.div
                  key={tab.id}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="px-4 pb-4 text-[#4b423c] leading-relaxed text-base md:text-lg overflow-hidden"
                >
                  {/* TAB CONTENT */}
                  {tab.id === "Description" && (
                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                  )}

                  {tab.id === "ProductDetails" && (
                    <ul className="list-disc pl-5 space-y-2 text-base md:text-lg">
                      {product.fragranceType && (
                        <li><strong>Fragrance Type:</strong> {product.fragranceType}</li>
                      )}
                      {selected?.size && (
                        <li><strong>Volume:</strong> {selected.size}</li>
                      )}
                      {product.longevity && (
                        <li><strong>Longevity:</strong> {product.longevity}</li>
                      )}
                      {product.sillage && (
                        <li><strong>Sillage:</strong> {product.sillage}</li>
                      )}
                      {product.topNotes?.length > 0 && (
                        <li><strong>Top Notes:</strong> {product.topNotes.join(", ")}</li>
                      )}
                      {product.heartNotes?.length > 0 && (
                        <li><strong>Heart Notes:</strong> {product.heartNotes.join(", ")}</li>
                      )}
                      {product.baseNotes?.length > 0 && (
                        <li><strong>Base Notes:</strong> {product.baseNotes.join(", ")}</li>
                      )}
                      <li><strong>Designed In:</strong> United Arab Emirates (UAE)</li>
                    </ul>
                  )}

                  {tab.id === "HowToUse" && (
                    <p>Spray on pulse points like neck & wrists. Avoid contact with eyes.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* FULL-WIDTH REVIEWS SECTION */}
      <div className="max-w-7xl md:max-w-9x1 mx-auto mt-20 px-2">
      {/* Title */}
      

      {/* Card container */}
      <div
      
        id="reviews-section"
        className="bg-white border border-[#e7e1cf] rounded-2xl shadow-sm px-0 sm:px-0 py-0"
      >
        <h2 className="text-2xl text-center font-semibold text-[#1b180d] px-2 sm:px-4 py-2 sm:py-4 border-b border-[#e7e1cf]">
        Customer Reviews
      </h2>
        <ProductReviews
          productId={product._id}
          onSummary={(data) => setReviewSummary(data)}
        />
      </div>
    </div>


      {/* FULL-WIDTH RELATED PRODUCTS (placeholder, if you want later) */}
      {/* <div className="max-w-7xl mx-auto mt-16">
        <RelatedProducts currentProductId={product._id} />
      </div> */}

      {lightboxOpen && (
  <Lightbox
    open={lightboxOpen}
    close={() => setLightboxOpen(false)}
    index={lightboxIndex}
    slides={product.images.map((src) => ({
      src: src?.original || src,
    }))}
    carousel={{ finite: false }}
    render={{
      slide: ({ slide }) => (
        <div className="flex items-center justify-center w-full h-full bg-black">
          <img
            src={slide.src}
            alt="fullscreen preview"
            className="max-w-[98vw] max-h-[92vh] object-contain"
          />
        </div>
      ),

      iconClose: () => (
        <div
          className="absolute top-5 right-5 text-white text-4xl font-bold z-999 cursor-pointer"
          onClick={() => setLightboxOpen(false)}
        >
          ×
        </div>
      ),

      iconPrev: () => (
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white text-5xl z-999 cursor-pointer select-none">
          ❮
        </div>
      ),

      iconNext: () => (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-white text-5xl z-999 cursor-pointer select-none">
          ❯
        </div>
      ),
    }}
  />
)}

    </section>
  )
}
