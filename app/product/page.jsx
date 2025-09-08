'use client'
import { useState } from 'react'
import Image from 'next/image'
import product from '../data/product.js'

export default function ProductPage() {
  const [selected, setSelected] = useState(product.variants[0])

  return (
    <section className="relative min-h-screen py-12 px-4 sm:px-6 bg-[#FCF8F3] flex flex-col md:flex-row items-center md:items-stretch gap-10 md:gap-14">
      
      {/* Subtle golden glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 w-[80%] sm:w-[480px] h-[200px] sm:h-[240px] bg-[radial-gradient(ellipse_at_center,_rgba(201,174,113,0.12)_0%,_rgba(252,248,243,0.9)_100%)] rounded-full blur-[55px]" />
      </div>

      {/* Product Image */}
      <div className="relative w-full md:w-1/2 flex justify-center items-center">
        <div className="absolute -z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[450px] h-[140px] sm:h-[200px] bg-[radial-gradient(ellipse_at_center,_rgba(255,189,103,0.1)_0%,_rgba(252,248,243,0)_100%)] rounded-3xl blur-[45px]" />
        <Image
          src={product.image}
          alt={product.name}
          width={320}
          height={420}
          className="object-contain rounded-2xl shadow-lg border border-[#e9dec2] bg-white/60 backdrop-blur-sm p-3 sm:p-4 max-w-[280px] sm:max-w-[350px]"
          priority
        />
      </div>

      {/* Product Details */}
      <div className="relative w-full md:w-1/2 flex flex-col justify-center gap-5 sm:gap-6 md:pr-8 text-center md:text-left">
        
        {/* Brand Tag */}
        <span className="tracking-[0.18em] font-serif text-[#B28C34] text-xs sm:text-sm uppercase">
          Raven Parfums
        </span>
        
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#8a6a1a] leading-snug sm:leading-tight">
          {product.name}
        </h1>

        {/* Divider */}
        <div className="mx-auto md:mx-0 w-16 sm:w-20 h-1 bg-gradient-to-r from-[#EFE2BA] via-[#B28C34] to-[#EFE2BA] rounded-full" />

        {/* Description */}
        <p className="text-[#3d2d0f] text-base sm:text-lg md:text-xl leading-relaxed max-w-xl mx-auto md:mx-0">
          {product.description}
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 mt-2">
          {product.featureIcons.map((icon, i) => (
            <div key={i} className="flex flex-col items-center text-[11px] sm:text-xs font-medium text-[#5a4c2b]">
              <span className="inline-flex w-11 h-11 sm:w-12 sm:h-12 mb-2 rounded-full border border-[#c7b57a] bg-white/70 backdrop-blur-sm shadow-sm items-center justify-center">
                <Image src={icon} alt={product.features[i]} width={28} height={28} className="sm:w-[30px] sm:h-[30px]" />
              </span>
              {product.features[i]}
            </div>
          ))}
        </div>

        {/* Variants */}
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center md:justify-start">
          {product.variants.map((v) => (
            <button 
              key={v.size}
              onClick={() => setSelected(v)}
              className={
                "px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all border shadow-sm " +
                (selected.size === v.size
                  ? "border-[#B28C34] bg-[#f9f6ec] text-[#6a5323] scale-105"
                  : "border-gray-200 bg-white text-[#7d6a42] hover:border-[#B28C34]/50")
              }
            >
              {v.size}
            </button>
          ))}
        </div>

        {/* Price */}
        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#B28C34]">
          ₹{selected.price}
        </div>

        {/* Desktop Add to Cart */}
        <div className="hidden md:block">
          <button className="rounded-lg px-8 py-3 bg-gradient-to-r from-[#B28C34] via-[#FFD700] to-[#B28C34] text-black font-semibold tracking-wide shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300">
            Add to Cart
          </button>
        </div>
      </div>

      {/* Mobile Sticky Add to Cart */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4 md:hidden">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-[#B28C34]">₹{selected.price}</span>
          <button className="rounded-lg px-6 py-3 bg-gradient-to-r from-[#B28C34] via-[#FFD700] to-[#B28C34] text-black font-semibold shadow-md hover:shadow-lg transition-transform duration-300">
            Add to Cart
          </button>
        </div>
      </div>
    </section>
  )
}
