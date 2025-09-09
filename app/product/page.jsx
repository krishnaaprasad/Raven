'use client'
import { useState } from 'react'
import Image from 'next/image'
import { FaStar, FaCheck, FaShoppingCart } from 'react-icons/fa'
import product from '../data/product'

export default function ProductPage() {
  const [selected, setSelected] = useState(product.variants[0])
  const [quantity, setQuantity] = useState(1)
  const [activeImg, setActiveImg] = useState(0)

  const increase = () => setQuantity(q => q + 1)
  const decrease = () => setQuantity(q => (q > 1 ? q - 1 : 1))

  return (
    <section className="min-h-screen bg-[#FCF8F3] py-10 px-2 sm:px-8 flex flex-col items-center">
      <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
        {/* Left side - Image and thumbnails */}
        <div className="flex flex-col items-center justify-center h-full py-4">
          <div className="relative flex flex-col items-center w-full">
            <div className="absolute -z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
              w-[340px] h-[150px] sm:w-[400px] sm:h-[190px] rounded-3xl 
              bg-[radial-gradient(ellipse_at_center,_rgba(224,174,70,0.13)_0%,_rgba(252,248,243,0.87)_100%)] 
              blur-[39px]" />
            <div className="w-full flex justify-center">
              <div className="aspect-square bg-white shadow rounded-2xl border border-[#e5ddc0] flex items-center justify-center max-w-[350px] w-full min-h-[350px]">
                <Image
                  src={product.images[activeImg]}
                  alt={`${product.name} Image ${activeImg + 1}`}
                  width={330}
                  height={350}
                  className="object-contain rounded-2xl"
                  priority
                  onError={e => e.currentTarget.style.display='none'}
                />
              </div>
            </div>
            {/* Thumbnails */}
            <div className="flex gap-3 mt-5 justify-center w-full">
              {product.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-14 h-14 rounded-xl border flex items-center justify-center bg-white shadow-sm
                    ${activeImg === i ? 'border-[#B28C34] ring-2 ring-[#B28C34]' : 'border-gray-200'}
                  `}
                  aria-label={`View product image ${i+1}`}
                >
                  <Image
                    src={src}
                    alt={`Thumbnail ${i+1}`}
                    width={52}
                    height={52}
                    className="object-contain"
                    onError={e => e.currentTarget.style.display='none'}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Product info + buy box */}
        <div className="flex flex-col items-center md:items-start justify-center px-2 py-4 w-full max-w-lg mx-auto">

          {/* Product Name */}
          <h1 className="font-serif font-bold text-3xl sm:text-4xl mb-5 text-[#1E140B] leading-tight w-full max-w-xs">
            {product.name}
          </h1>

          {/* Subtitle */}
          <p className="text-[#755B00] text-sm md:text-base mb-5 font-medium w-full max-w-xs">
            Long lasting | Premium scent | Fragrance
          </p>

          {/* Price */}
          <div className="w-full max-w-xs mb-4">
            <p className="text-gray-700 text-xs font-semibold mb-1">
              MRP ₹{Math.round(selected.price * 1.10)} (Incl. of all taxes)
            </p>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-extrabold text-[#B28C34] leading-none">₹{selected.price}</span>
              <span className="text-gray-400 line-through text-lg leading-none">
                ₹{Math.round(selected.price * 1.10)}
              </span>
            </div>
          </div>

          {/* Size Selector */}
          <div className="w-full max-w-xs mb-5">
            <p className="text-[#4B423C] font-semibold mb-2">Size: {selected.size}</p>
            <div className="flex gap-3">
              {product.variants.map((v) => (
                <button
                  key={v.size}
                  onClick={() => setSelected(v)}
                  className={`rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                    selected.size === v.size
                      ? 'bg-black text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {v.size.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Benefits list */}
          <div className="w-full max-w-xs mb-6">
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

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-3 w-full max-w-xs mb-4">
            <div className="flex items-center border border-[#D0C5A3] rounded-full overflow-hidden bg-white">
              <button onClick={decrease} className="px-4 py-2 text-lg font-semibold text-[#917B2E]">−</button>
              <span className="px-6 py-2 font-semibold">{quantity}</span>
              <button onClick={increase} className="px-4 py-2 text-lg font-semibold text-[#917B2E]">+</button>
            </div>
            <button className="flex-1 flex items-center justify-center gap-2 border border-black rounded-full py-3 font-semibold text-xs uppercase hover:bg-black hover:text-white transition">
              <FaShoppingCart /> ADD TO CART
            </button>
          </div>

          {/* Buy It Now */}
          <button className="w-full max-w-xs rounded-full bg-black text-white py-3 font-semibold uppercase tracking-wide hover:bg-gray-900 transition">
            BUY IT NOW
          </button>
        </div>
      </div>
    </section>
  )
}
