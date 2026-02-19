'use client'


import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FaCheck, FaShoppingCart } from 'react-icons/fa';
import ProductReviews from "@/components/ProductReviews";
import { Star } from "lucide-react";
import { Share2, Check } from "lucide-react";

// Swiper (mobile gallery)
import SwiperCore from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Thumbs, Pagination } from 'swiper/modules';
SwiperCore.use([Thumbs, Pagination]);

import 'swiper/css';
import 'swiper/css/thumbs';
import 'swiper/css/pagination';

import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

import { motion, AnimatePresence } from "framer-motion";
import { useCart } from '@/app/context/cartcontext';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { event } from "@/lib/ga";

// ---------- Cloudinary Helper ----------
function buildCloudinaryUrl(url, { w, h, crop = 'fill', quality = 'auto' } = {}) {
  if (!url || typeof url !== 'string') return url;

  // Only touch Cloudinary image URLs
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }

  const [prefix, rest] = url.split("/image/upload/");
  const transforms = [`f_auto`, `q_${quality}`];

  if (w) transforms.push(`w_${w}`);
  if (h) transforms.push(`h_${h}`);
  if (crop) transforms.push(`c_${crop}`);

  return `${prefix}/image/upload/${transforms.join(",")}/${rest}`;
}

export default function ProductClient({ slug }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [reviewSummary, setReviewSummary] = useState({ avg: 0, total: 0 });
  const [activeTab, setActiveTab] = useState("");

  const [openSections, setOpenSections] = useState({
    Description: true,
    ProductDetails: false,
    HowToUse: false,
  });

  const { addToCart } = useCart();
  const router = useRouter();

  const [copied, setCopied] = useState(false);

const handleShare = async () => {
  const shareData = {
    title: product.name,
    text: `Discover ${product.name} on Raven Fragrance`,
    url: window.location.href,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  } catch (err) {
    console.error("Share failed:", err);
  }
};


  const toggleSection = (tabId) =>
    setOpenSections((prev) => ({ ...prev, [tabId]: !prev[tabId] }));

  // ─────────────────────────
  // Fetch product
  // ─────────────────────────
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${slug}`);
        const data = await res.json();

        if (res.ok && data) {
          setProduct(data);
          setSelected(data.variants?.[0]);
          // 🔥 GA4: Track product view
event({
  action: "view_item",
  params: {
    currency: "INR",
    value: data.variants?.[0]?.price || 0,
    items: [
      {
        item_id: data._id,
        item_name: data.name,
        price: data.variants?.[0]?.price || 0,
        category: "Perfume",
      },
    ],
  },
});

        } else {
          router.replace("/");
          toast.error("This product is no longer available");
        }
      } catch (error) {
        router.replace("/");
        toast.error("This product is unavailable");
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchProduct();
  }, [slug, router]);

  // ─────────────────────────
  // Skeleton while loading / missing
  // ─────────────────────────
  if (!product || !selected) {
    return (
      <section className="min-h-screen bg-(--theme-bg) py-12 flex justify-center">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 animate-pulse" />
      </section>
    );
  }

  // ─────────────────────────
  // Helpers
  // ─────────────────────────
  const increase = () => setQuantity((q) => q + 1);
  const decrease = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handleAddToCart = () => {
    setIsAdding(true);

    const imageUrl = Array.isArray(product.images)
      ? (product.images[0]?.original || product.images[0])
      : product.image || '';

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
    );

    // 🔥 GA4: Track add to cart
    event({
      action: "add_to_cart",
      params: {
        currency: "INR",
        value: selected.price * quantity,
        items: [
          {
            item_id: product._id,
            item_name: product.name,
            price: selected.price,
            quantity,
          },
        ],
      },
    });

    toast.success(`${product.name} (${selected.size}) added to cart!`);
    setTimeout(() => setIsAdding(false), 800);
  };

  const handleBuyNow = () => {
    const buyNowItem = {
      id: product._id,
      name: product.name,
      slug: product.slug,
      price: selected.price,
      mrp: selected.mrp,
      image: Array.isArray(product.images)
        ? (product.images[0]?.original || product.images[0])
        : product.image || '',
      size: selected.size,
      quantity,
    };

    sessionStorage.setItem("buyNowItem", JSON.stringify(buyNowItem));
    router.push('/checkout?mode=buynow');
  };

  // Scroll to Reviews & open Review section
  const scrollToReviews = () => {
    const section = document.getElementById("reviews-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveTab("Review");
      setOpenSections((prev) => ({ ...prev, Review: true }));
    }
  };

  const formatAmount = (value) => {
    if (!value || isNaN(value)) return "0.00";
    return Number(value).toFixed(2);
  };

  const hasRatingSummary =
    typeof product.averageRating === "number" &&
    typeof product.reviewCount === "number";

  const mainDesktopImage =
    product.images[lightboxIndex]?.original || product.images[lightboxIndex];

    // ----------- JSON-LD SEO Structured Data -----------
    const productJsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.shortDescription || product.metaDescription,
      image: product.images?.map((i) => i.original || i),
      sku: product._id,
      brand: {
        "@type": "Brand",
        name: "Raven Fragrance",
      },
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: selected.price,
        url: `https://www.ravenfragrance.in/product/${product.slug}`,
        availability: "https://schema.org/InStock",
      },
      aggregateRating:
        product.averageRating && product.reviewCount > 0
          ? {
              "@type": "AggregateRating",
              ratingValue: product.averageRating,
              reviewCount: product.reviewCount,
            }
          : undefined,
    };

  // ─────────────────────────
  // UI
  // ─────────────────────────
  return (
    <section className="min-h-screen bg-(--theme-bg) py-8 px-4 sm:px-8 transition-colors duration-500">
      {/* SEO Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      {/* Top 2-column layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] gap-10 md:gap-16 items-start">
        {/* DESKTOP STICKY GALLERY */}
        <div className="hidden md:block md:sticky md:top-24 self-start">
          <div className="flex gap-4 items-start">
            {/* Left Thumbnails */}
            <div className="flex flex-col gap-3 w-24 max-h-[80vh] overflow-y-auto">
              {product.images.map((src, index) => {
                const raw = src?.thumbnail || src;
                const thumb = buildCloudinaryUrl(raw, {
                  w: 110,
                  h: 110,
                  crop: 'fill',
                });

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
                      alt={`${product.name} thumbnail ${index + 1}`}
                      width={110}
                      height={110}
                      className="object-cover w-full h-[110px]"
                    />
                  </div>
                );
              })}
            </div>

            {/* Main Image */}
            <div className="flex-1 flex items-center justify-center rounted-lg max-h-[80vh]">
              <Image
                src={buildCloudinaryUrl(mainDesktopImage, {
                  w: 650,
                  h: 750,
                  crop: 'fit',
                })}
                alt={product.name}
                width={650}
                height={750}
                className="object-contain rounded-lg cursor-pointer max-h-[80vh] w-full"
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
            {product.images?.map((src, i) => {
              const raw = src?.original || src;
              const mobileUrl = buildCloudinaryUrl(raw, {
                w: 650,
                h: 750,
                crop: 'fill',
              });

              return (
                <SwiperSlide key={i}>
                  <Image
                    src={mobileUrl}
                    alt={product.name}
                    width={650}
                    height={750}
                    className="w-full h-auto object-contain rounded-xl cursor-pointer"
                    onClick={() => {
                      setLightboxIndex(i);
                      setLightboxOpen(true);
                    }}
                  />
                </SwiperSlide>
              );
            })}
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
            {product.images?.map((src, i) => {
              const raw = src?.thumbnail || src;
              const thumb = buildCloudinaryUrl(raw, {
                w: 100,
                h: 100,
                crop: 'fill',
              });

              return (
                <SwiperSlide key={i}>
                  <Image
                    src={thumb}
                    alt={`thumb-${i}`}
                    width={100}
                    height={100}
                    className="rounded-lg border border-gray-300 object-cover h-[90px] w-[90px] cursor-pointer"
                    onClick={() => setLightboxIndex(i)}
                  />
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* RIGHT: Product Details */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  className="flex flex-col gap-4 w-full max-w-xl mx-auto"
>
{/* Title + Share */}
<div className="flex items-start justify-between gap-4">

  <h1
  className="
    font-[Crimson_Text]
    text-3xl sm:text-4xl lg:text-5xl
    leading-tight
    tracking-tight
    text-(--theme-text)
  "
>
  {product.name}
</h1>

  {/* Share Button */}
<button
  onClick={handleShare}
  className="
    flex items-center gap-2
    font-[system-ui] font-medium
    text-xs uppercase tracking-[0.18em]
    text-(--theme-muted)
    hover:text-(--theme-text)
    transition-colors duration-300
  "
>
  {copied ? (
    <Check className="w-4 h-4" />
  ) : (
    <Share2 className="w-4 h-4" />
  )}
  {copied ? "Copied" : "Share"}
</button>
</div>


  {/* ▸ Dynamic Accords */}
  {product.accords?.length > 0 && (
    <p className="font-[system-ui] text-xs uppercase font-medium tracking-[0.2em] mt-0 text-(--theme-muted)">
      {product.accords.slice(0, 3).join(" | ")}
    </p>
  )}

{/* ⭐ Average Rating */}
{product.reviewCount > 0 && typeof product.rating === "number" && (
  <button
    onClick={scrollToReviews}
    className="flex items-center gap-2 group mt-1 cursor-pointer"
  >
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(product.rating);

        return (
          <Star
            key={star}
            className={`
              w-4 h-4 transition-all duration-200
              ${
                filled
                  ? "fill-current text-(--theme-text)"
                  : "text-(--theme-border)"
              }
              group-hover:scale-105
            `}
          />
        );
      })}
    </div>

    <span className="font-[system-ui] text-xs text-(--theme-muted) group-hover:text-(--theme-text) transition-colors">
      {product.reviewCount}{" "}
      {product.reviewCount === 1 ? "review" : "reviews"}
    </span>
  </button>
)}

  

  {/* ▸ Price Block */}
  <div className="space-y-1">
  <div className="flex items-center gap-3">
    <span className="font-[system-ui] text-2xl font-semibold text-(--theme-text)">
      ₹{formatAmount(selected.price)}
    </span>

    {selected.mrp && (
      <span className="font-[system-ui] text-sm line-through text-(--theme-muted)">
        ₹{formatAmount(selected.mrp)}
      </span>
    )}
  </div>

  <p className="font-[system-ui] text-sm text-(--theme-muted)">
    Tax Included.
  </p>
</div>


  <div className="border-t border-(--theme-border)" />

  {/* ▸ Size Selector */}
  <div>
    <p className="font-[system-ui] text-xs uppercase tracking-[0.2em] text-(--theme-muted) mb-3">
      Volume
    </p>

    <div className="flex gap-3">
  {product.variants?.map((v, i) => (
    <button
      key={i}
      onClick={() => setSelected(v)}
      className={`
        px-5 py-2
        font-[system-ui]
        text-xs uppercase tracking-[0.18em]
        border
        transition-all duration-300
        ${
          selected.size === v.size
            ? "border-(--theme-text) text-(--theme-text)"
            : "border-(--theme-border) text-(--theme-muted) hover:text-(--theme-text)"
        }
      `}
    >
      {v.size} ML
    </button>
  ))}
</div>
  </div>

  {/* ▸ Quantity */}
  <div>
    <p className="font-[system-ui] text-xs uppercase tracking-[0.2em] text-(--theme-muted) mb-3">
      Quantity
    </p>

    <div className="inline-flex items-center border border-(--theme-border)">
      <button
        onClick={decrease}
        className="w-10 h-10 flex items-center justify-center text-(--theme-text) hover:bg-(--theme-soft)"
      >
        −
      </button>

      <span className="w-12 text-center font-[system-ui] text-sm">
        {quantity}
      </span>

      <button
        onClick={increase}
        className="w-10 h-10 flex items-center justify-center text-(--theme-text) hover:bg-(--theme-soft)"
      >
        +
      </button>
    </div>
  </div>

  {/* ▸ CTA Buttons */}
  <div className="flex flex-col gap-3">
    <button
  onClick={handleAddToCart}
  disabled={isAdding}
  className="
    h-12
    bg-(--theme-text)
    text-(--theme-bg)
    font-[system-ui]
    text-xs uppercase tracking-[0.2em]
    transition-all duration-300
    hover:opacity-90
    disabled:opacity-60
  "
>
  {isAdding ? "Added" : "Add to Cart"}
</button>


    <button
  onClick={handleBuyNow}
  className="
    h-12
    border border-(--theme-text)
    text-(--theme-text)
    font-[system-ui]
    text-xs uppercase tracking-[0.2em]
    hover:bg-(--theme-text)
    hover:text-(--theme-bg)
    transition-all duration-300
  "
>
  Buy Now
</button>

  </div>

  <div className="border-t border-(--theme-border) pt-4" />

  {/* ▸ Accordion */}
  <div className="border border-(--theme-border)">
    {[
      { id: "Description", label: "Description" },
      { id: "ProductDetails", label: "Product Details" },
      { id: "HowToUse", label: "How To Use" },
    ].map((tab) => (
      <div key={tab.id} className="border-b last:border-b-0 border-(--theme-border)">
        <button
          onClick={() => toggleSection(tab.id)}
          className="w-full flex justify-between items-center py-4 px-4 font-[system-ui] text-sm text-(--theme-muted) uppercase tracking-[0.15em] leading-relaxed"
        >
          {tab.label}
          {openSections[tab.id] ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>

        <AnimatePresence initial={false}>
          {openSections[tab.id] && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="px-4 pb-4 font-[system-ui] text-sm text-(--theme-muted) leading-relaxed"
            >
              {tab.id === "Description" && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: product.description,
                  }}
                />
              )}

              {tab.id === "ProductDetails" && (
                <ul className="space-y-2">
                  {product.fragranceType && (
                    <li><strong>Type:</strong> {product.fragranceType}</li>
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
                </ul>
              )}

              {tab.id === "HowToUse" && (
                <p>
                  Spray 3–6 inches away on pulse points like neck and wrists
                  for optimal longevity and projection.
                </p>
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
        <div
          id="reviews-section"
          className="bg-(--theme-soft) border border-(--theme-border) rounded-xl"
        >
          <h2 className="text-lg md:text-2xl text-center text-(--theme-text) font-semibold  px-2 sm:px-4 py-2 sm:py-4 border-b border-(--theme-border)">
            Customer Reviews for {product.name}
          </h2>
          <ProductReviews
            productId={product._id}
            onSummary={(data) => setReviewSummary(data)}
          />
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX (DESKTOP + MOBILE) */}
      {lightboxOpen && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={lightboxIndex}
          slides={product.images.map((src) => {
            const raw = src?.original || src;
            return {
              src: buildCloudinaryUrl(raw, {
                w: 1400,
                h: 1400,
                crop: 'fit',
              }),
            };
          })}
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
              <div className="text-white text-2xl leading-none">×</div>
            ),
          }}
        />
      )}
    </section>
  );
}

<style jsx global>{`
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn .45s ease-in-out;
  }
`}</style>