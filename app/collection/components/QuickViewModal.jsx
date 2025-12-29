'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import { useCart } from "@/app/context/cartcontext";
import { toast } from "react-hot-toast";
import { useQuickView } from "@/app/context/QuickViewContext";

const QuickViewModal = () => {
  const router = useRouter();
  const { product, isOpen, closeQuickView } = useQuickView();

  const { addToCart, openCart } = useCart();


  const variants = product?.variants || [];
  const defaultSize = variants?.[0]?.size || '';

  const [selectedSize, setSelectedSize] = useState(defaultSize);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('notes');

  // Reset when product changes / modal opens
  useEffect(() => {
    if (product) {
      setSelectedSize(variants?.[0]?.size || '');
      setQuantity(1);
      setActiveTab('notes');
    }
  }, [product]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const activeVariant =
    variants.find((v) => v.size === selectedSize) || variants[0];

  const price = activeVariant?.price || 0;
  const stock = activeVariant?.stock ?? 0;
  
  const images = (product?.images || [])
  .map((img) => (typeof img === 'string' ? img : img?.original))
  .filter(Boolean); // removes "", null, undefined


const handleAddToCart = () => {
  if (!product || stock <= 0) return;

  const imageSrc = images[0] || null;

  addToCart(
    {
      id: product._id,
      name: product.name,
      slug: product.slug,
      price: Number(price) || 0,
      image: imageSrc,
      size: selectedSize || "",
    },
    quantity
  );

  toast.success(`${product.name} added to cart`, {
    style: {
      background: "#1b180d",
      color: "#fff",
      border: "1px solid #B28C34",
    },
  });

  closeQuickView();
  setTimeout(() => openCart(), 50);
};


  const handleBuyNow = () => {
  if (!product || stock <= 0) return;

  const imageSrc = images[0] || null;

  const buyNowItem = {
    id: product._id,
    name: product.name,
    slug: product.slug,
    price: Number(price) || 0,
    image: imageSrc,
    size: selectedSize || "",
    quantity,
  };

  sessionStorage.setItem("buyNowItem", JSON.stringify(buyNowItem));
  closeQuickView();
  router.push("/checkout?mode=buynow");
};


  const handleQuantityChange = (delta) => {
    const next = quantity + delta;
    if (next >= 1 && next <= 10) setQuantity(next);
  };


  
const viewDetails = () => {
  if (!product) return;
  closeQuickView(); // or handleClose() if you’re using animation
  router.push(`/product/${product.slug}`);
};


  return (
    <div className="fixed inset-0 z-1400 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Close */}
        <button
          onClick={closeQuickView}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/90 rounded-full hover:bg-[#f3f1ea] transition"
          aria-label="Close modal"
        >
          <Icon name="XMarkIcon" size={22} className="text-[#1b180d]" />
        </button>

        <div className="overflow-y-auto max-h-[90vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Image */}
            <div className="relative aspect-3/4 overflow-hidden rounded-lg bg-[#f3f1ea]">
            <Swiper
                modules={[Autoplay]}
                spaceBetween={10}
                slidesPerView={1}
                loop={true}
                autoplay={{
                    delay: 3000, // 3 seconds
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                }}
                className="w-full h-full"
                >

                {(images.length ? images : [product?.image])
                .filter(Boolean)
                .map((src, i) => (
                  <SwiperSlide key={i}>
                    <AppImage
                      src={src}
                      alt={product?.name}
                      className="w-full h-full object-cover"
                    />
                  </SwiperSlide>
              ))}
            </Swiper>

            {product?.isNew && (
                <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-[#b28c34] text-white text-xs rounded-full font-[Outfit]">
                New Arrival
                </div>
            )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Brand & Name */}
              <div>
                <p className="text-sm uppercase tracking-wide text-[#6b6453] font-[Outfit] mb-2">
                  {product?.brand}
                </p>
                <h2
                  onClick={viewDetails}
                  className="text-3xl font-[Cormorant_Garamond] font-semibold text-[#1b180d] mb-3 cursor-pointer hover:text-[#b28c34] transition"
                >
                  {product?.name}
                </h2>


                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Icon
                        key={i}
                        name="StarIcon"
                        size={16}
                        variant={
                          i < Math.floor(product?.rating || 0)
                            ? 'solid'
                            : 'outline'
                        }
                        className={
                          i < Math.floor(product?.rating || 0)
                            ? 'text-[#b28c34]'
                            : 'text-[#d1cbb8]'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm text-[#6b6453] font-[Outfit]">
                    {product?.rating} ({product?.reviewCount || 0})
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <p className="font-serif text-3xl font-semibold text-[#1b180d]">
                  ₹{price.toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-[#6b6453] font-[Outfit]">
                  Inc. of all taxes
                </p>
              </div>

              {/* Fragrance */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#f3f1ea] rounded-lg">
                <Icon name="SparklesIcon" size={18} className="text-[#b28c34]" />
                <span className="text-sm font-[Outfit] text-[#1b180d]">
                  {product?.fragranceType} Fragrance
                </span>
              </div>

              {/* Sizes */}
              {variants.length > 0 && (
                <div>
                  <label className="block text-sm font-[Outfit] font-medium text-[#1b180d] mb-3">
                    Select Size
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {variants.map((v) => (
                      <button
                        key={v.size}
                        onClick={() => setSelectedSize(v.size)}
                        className={`px-6 py-3 border rounded-md font-[Outfit] text-sm transition ${
                          selectedSize === v.size
                            ? 'border-[#b28c34] bg-[#b28c34]/10 text-[#b28c34]'
                            : 'border-[#e7e1cf] text-[#1b180d] hover:border-[#b28c34]'
                        }`}
                      >
                        {v.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity + More details */}
<div className="flex items-end justify-between">
  {/* Quantity */}
  <div>
    <label className="block text-sm font-[Outfit] font-medium text-[#1b180d] mb-3">
      Quantity
    </label>

    <div className="flex items-center gap-3">
      <button
        onClick={() => handleQuantityChange(-1)}
        disabled={quantity <= 1}
        className="w-9 h-9 flex items-center justify-center border border-[#e7e1cf] rounded-md hover:bg-[#f3f1ea] disabled:opacity-50 transition"
      >
        <Icon name="MinusIcon" size={16} />
      </button>

      <span className="w-10 text-center font-[Outfit] text-base font-medium">
        {quantity}
      </span>

      <button
        onClick={() => handleQuantityChange(1)}
        disabled={quantity >= 10}
        className="w-9 h-9 flex items-center justify-center border border-[#e7e1cf] rounded-md hover:bg-[#f3f1ea] disabled:opacity-50 transition"
      >
        <Icon name="PlusIcon" size={16} />
      </button>
    </div>
  </div>

  {/* More details */}
  <button
    onClick={viewDetails}
    className="font-[Outfit] text-sm text-[#6b6453] hover:text-[#b28c34] underline underline-offset-4 transition self-end cursor-pointer"
  >
    More details →
  </button>
</div>


              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={stock <= 0}
                className="w-full py-4 bg-[#b28c34] text-white rounded-md font-[Outfit] text-base font-medium hover:bg-[#9a864c] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Icon name="ShoppingBagIcon" size={20} />
                {stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>

              {/* Buy Now */}
              <button
                onClick={handleBuyNow}
                disabled={stock <= 0}
                className="w-full py-3 border border-[#b28c34] text-[#b28c34] rounded-md font-[Outfit] text-sm font-medium hover:bg-[#b28c34] hover:text-white transition disabled:opacity-50"
              >
                Buy Now
              </button>

              {/* Tabs */}
              <div className="border-t border-[#e7e1cf] pt-6">
                <div className="flex gap-6 border-b border-[#e7e1cf]">
                  {['notes', 'details'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 font-[Outfit] text-sm transition ${
                        activeTab === tab
                          ? 'text-[#b28c34] border-b-2 border-[#b28c34]'
                          : 'text-[#6b6453] hover:text-[#1b180d]'
                      }`}
                    >
                      {tab === 'notes'
                        ? 'Fragrance Notes'
                        : 'Product Details'}
                    </button>
                  ))}
                </div>

                <div className="pt-4">
                  {activeTab === 'notes' && (
  <div className="space-y-4">
    {[
      { layer: 'Top Notes', notes: product?.topNotes || [] },
      { layer: 'Heart Notes', notes: product?.heartNotes || [] },
      { layer: 'Base Notes', notes: product?.baseNotes || [] },
    ]
      .filter((l) => l.notes.length > 0)
      .map((layer, i) => (
        <div key={i}>
          <h4 className="text-sm font-[Outfit] font-medium text-[#1b180d] mb-2">
            {layer.layer}
          </h4>
          <div className="flex flex-wrap gap-2">
            {layer.notes.map((note, j) => (
              <span
                key={j}
                className="px-3 py-1 bg-[#f3f1ea] text-[#6b6453] text-xs rounded-full"
              >
                {note}
              </span>
            ))}
          </div>
        </div>
      ))}
  </div>
)}


                  {activeTab === 'details' && (
                    <div className="space-y-3 text-sm text-[#6b6453] font-[Outfit]">
                      <p>
                        <span className="font-medium text-[#1b180d]">
                          Concentration:
                        </span>{' '}
                        {product?.concentration}
                      </p>
                      <p>
                        <span className="font-medium text-[#1b180d]">
                          Longevity:
                        </span>{' '}
                        {product?.longevity}
                      </p>
                      <p>
                        <span className="font-medium text-[#1b180d]">
                          Sillage:
                        </span>{' '}
                        {product?.sillage}
                      </p>
                      <div
                        className="pt-2 prose prose-sm max-w-none text-[#6b6453]"
                        dangerouslySetInnerHTML={{ __html: product?.description || '' }}
                        />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
