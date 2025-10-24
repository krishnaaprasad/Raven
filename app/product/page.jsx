'use client'
import { useState } from 'react'
import Image from 'next/image'
import { FaCheck, FaShoppingCart } from 'react-icons/fa'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Thumbs, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/thumbs'
import 'swiper/css/pagination'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { motion } from 'framer-motion'

import product from '../data/product'
import { useCart } from '../context/cartcontext'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function ProductPage() {
  const [selected, setSelected] = useState(product.variants[0])
  const [quantity, setQuantity] = useState(1)
  const [thumbsSwiper, setThumbsSwiper] = useState(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [isAdding, setIsAdding] = useState(false)

  const { addToCart } = useCart()
  const router = useRouter()

  const increase = () => setQuantity((q) => q + 1)
  const decrease = () => setQuantity((q) => (q > 1 ? q - 1 : 1))

  const handleAddToCart = () => {
    setIsAdding(true)
    addToCart(
      {
        id: product.id,
        name: product.name,
        size: selected.size,
        price: selected.price,
        image: product.images[0],
      },
      quantity
    )
    toast.success(`${product.name} (${selected.size}) added to cart!`)
    setTimeout(() => setIsAdding(false), 800)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push('/checkout')
  }

  return (
    <section className="min-h-screen bg-[#FCF8F3] py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
        {/* Left side - Gallery */}
        <div className="w-full">
          <Swiper
            spaceBetween={10}
            pagination={{ clickable: true }}
            thumbs={{ swiper: thumbsSwiper }}
            modules={[Thumbs, Pagination]}
            className="mb-4 bg-white shadow rounded-xl"
          >
            {product.images.map((src, i) => (
              <SwiperSlide
                key={i}
                className="flex items-center justify-center cursor-zoom-in"
                onClick={() => {
                  setLightboxIndex(i)
                  setLightboxOpen(true)
                }}
              >
                <Image
                  src={src.original}
                  alt={`Product Image ${i + 1}`}
                  width={500}
                  height={500}
                  className="object-contain w-full h-auto max-h-[500px] rounded-xl"
                />
              </SwiperSlide>
            ))}
          </Swiper>

          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={10}
            slidesPerView={4}
            watchSlidesProgress
            modules={[Thumbs]}
          >
            {product.images.map((src, i) => (
              <SwiperSlide key={i} className="cursor-pointer">
                <Image
                  src={src.thumbnail}
                  alt={`Thumbnail ${i + 1}`}
                  width={100}
                  height={100}
                  className="object-contain w-full h-auto"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Right side - Product Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6 w-full max-w-lg mx-auto"
        >
          <h1 className="font-serif font-druzhba text-3xl sm:text-4xl text-[#1E140B] leading-tight">
            {product.name}
          </h1>

          <p className="text-[#755B00] text-sm md:text-base font-medium">
            Long lasting | Premium scent | Fragrance
          </p>

          <div>
            <p className="text-gray-700 text-xs font-semibold mb-1">
              MRP ₹{Math.round(selected.price * 1.365)} (Incl. of all taxes)
            </p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-extrabold text-[#B28C34]">₹{selected.price}</span>
              <span className="text-gray-400 line-through text-lg">
                ₹{Math.round(selected.price * 1.365)}
              </span>
            </div>
          </div>

          {/* Size Selector */}
          <div>
            <p className="text-[#4B423C] font-semibold mb-2">Size: {selected.size}</p>
            <div className="flex flex-wrap gap-3">
              {product.variants.map((v) => (
                <button
                  key={v.size}
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
          <div>
            <p className="font-bold mb-2 text-[#231F20]">What makes it great:</p>
            <ul className="space-y-2 text-[#5F544E] text-sm">
              {product.benefits?.map((b, i) => (
                <li key={i} className="flex items-center gap-2">
                  <FaCheck className="text-[#b28c34]" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-3 w-full">
            <div className="flex items-center border border-[#D0C5A3] rounded-full overflow-hidden bg-white">
              <button onClick={decrease} className="px-4 py-2 text-lg font-semibold text-[#917B2E]">−</button>
              <span className="px-6 py-2 font-semibold">{quantity}</span>
              <button onClick={increase} className="px-4 py-2 text-lg font-semibold text-[#917B2E]">+</button>
            </div>

            <motion.button
              onClick={handleAddToCart}
              whileTap={{ scale: 0.9 }}
              animate={isAdding ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.9 }}
              className="flex-1 flex items-center justify-center gap-2 rounded-full border border-black py-3 font-semibold text-xs uppercase bg-white hover:bg-black hover:text-white transition"
            >
              <FaShoppingCart /> {isAdding ? 'Added!' : 'Add to Cart'}
            </motion.button>
          </div>

          {/* Buy Now */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-full rounded-full bg-black text-white py-3 font-semibold uppercase tracking-wide hover:bg-gray-900 transition"
            onClick={handleBuyNow}
          >
            Buy it Now
          </motion.button>
        </motion.div>
      </div>

      {lightboxOpen && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={product.images.map((src) => ({ src: src.original }))}
          index={lightboxIndex}
          on={{ view: ({ index }) => setLightboxIndex(index) }}
        />
      )}
    </section>
  )
}
