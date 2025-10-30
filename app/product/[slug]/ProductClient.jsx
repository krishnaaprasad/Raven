'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { FaCheck, FaShoppingCart } from 'react-icons/fa'

// ✅ FIX: import SwiperCore and register modules manually
import SwiperCore from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Thumbs, Pagination } from 'swiper/modules'

// ✅ register modules before using Swiper
SwiperCore.use([Thumbs, Pagination])

import 'swiper/css'
import 'swiper/css/thumbs'
import 'swiper/css/pagination'

import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { motion } from 'framer-motion'
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

  const { addToCart } = useCart()
  const router = useRouter()

 useEffect(() => {
  async function fetchProduct() {
    try {
      const res = await fetch(`/api/products/${slug}`)
      const data = await res.json()
      if (res.ok && data) {
        setProduct(data)
        setSelected(data.variants?.[0])
      } else {
        console.error(data.message || 'Product not found')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false) // <== Important! stop loading state here
    }
  }
  if (slug) fetchProduct()
}, [slug])

  if (!product || !selected) {
  return (
    <section className="min-h-screen bg-[#FCF8F3] py-12 flex justify-center">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 animate-pulse">
        {/* Image Skeleton */}
        <div className="w-full flex flex-col gap-4">
          <div className="relative h-[500px] w-full rounded-xl overflow-hidden bg-[#eae2cf] shimmer"></div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#eae2cf] h-24 w-24 rounded-lg shimmer"></div>
            ))}
          </div>
        </div>

        {/* Text Skeleton */}
        <div className="flex flex-col gap-5">
          <div className="bg-[#eae2cf] h-8 w-2/3 rounded shimmer"></div>
          <div className="bg-[#eae2cf] h-4 w-1/3 rounded shimmer"></div>
          <div className="bg-[#eae2cf] h-6 w-1/2 rounded shimmer"></div>
          <div className="space-y-3 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#eae2cf] h-3 rounded w-full shimmer"></div>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <div className="bg-[#eae2cf] h-12 w-1/2 rounded-full shimmer"></div>
            <div className="bg-[#eae2cf] h-12 w-1/2 rounded-full shimmer"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        .shimmer::before {
          content: "";
          position: absolute;
          top: 0;
          left: -150px;
          width: 100px;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 215, 140, 0.4), transparent);
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% {
            left: -150px;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </section>
  )
}


  const increase = () => setQuantity(q => q + 1)
  const decrease = () => setQuantity(q => (q > 1 ? q - 1 : 1))

  const handleAddToCart = () => {
    setIsAdding(true)
    addToCart(
      {
        id: product._id,
        name: product.name,
        size: selected.size,
        price: selected.price,
        image: product.images?.[0],
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
        {/* Product Image Section */}
    <div className="w-full">
      <Swiper
       spaceBetween={10}
       pagination={{ clickable: true }}
       thumbs={{ swiper: thumbsSwiper }}
       modules={[Thumbs, Pagination]}
       className="mb-4 bg-white shadow rounded-xl"
      >
        {product.images.map((src, i) => {
          // Support both { original: "" } and plain string "/img.jpg"
          const imageSrc = src?.original || src;
          return (
            <SwiperSlide
                key={i}
                className="flex items-center justify-center cursor-zoom-in"
                onClick={() => {
                  setLightboxIndex(i)
                  setLightboxOpen(true)
                }}
              >
              <Image
                src={imageSrc}
                alt={`Raven Fragrance - ${product.name}`}
                width={500}
                height={500}
                className="object-contain w-full h-auto max-h-[500px] rounded-xl"
              />
            </SwiperSlide>
          )
        })}
      </Swiper>

      {/* Thumbnail Swiper */}
      <Swiper
        onSwiper={setThumbsSwiper}
        spaceBetween={10}
        slidesPerView={4}
        freeMode
        watchSlidesProgress
        className="mt-2"
      >
        {product.images.map((src, i) => {
          const thumbSrc = src?.thumbnail || src;
          return (
            <SwiperSlide key={i}>
              <Image
                src={thumbSrc}
                alt={`Raven Fragrance - ${product.name}`}
                width={100}
                height={100}
                className="object-cover w-full h-24 rounded-lg border border-gray-200 hover:border-black cursor-pointer transition-all"
              />
            </SwiperSlide>
          )
        })}
      </Swiper>
    </div>



        {/* Product Details */}
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

          <div>
            <p className="text-[#4B423C] font-semibold mb-2">Size: {selected.size}</p>
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

          {product.benefits?.length > 0 && (
            <div>
              <p className="font-bold mb-2 text-[#231F20]">What makes it great:</p>
              <ul className="space-y-2 text-[#5F544E] text-sm">
                {product.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <FaCheck className="text-[#b28c34]" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

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
          slides={product.images.map(src => ({ src: src?.original || src }))}
          index={lightboxIndex}
          on={{ view: ({ index }) => setLightboxIndex(index) }}
        />
      )}
    </section>
  )
}
