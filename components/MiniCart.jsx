'use client'

import { useCart } from '../app/context/cartcontext'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrashIcon } from '@heroicons/react/24/outline'

// ✅ Utility to ensure .00 formatting
const formatAmount = (amount) => {
  if (!amount || isNaN(amount)) return "0.00"
  return parseFloat(amount).toFixed(2)
}

function MiniCartDrawer({ isOpen, onClose }) {
  const { cartItems, removeFromCart, updateQuantity, cartCount } = useCart()
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const router = useRouter()

  const handleCheckout = () => {
    onClose?.()
    router.push('/checkout')
  }

  // shimmer placeholder for images
  const shimmer =
    'data:image/svg+xml;base64,' +
    btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="g">
            <stop stop-color="#f6f6f6" offset="20%" />
            <stop stop-color="#eaeaea" offset="50%" />
            <stop stop-color="#f6f6f6" offset="70%" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" fill="#f6f6f6" />
        <rect id="r" width="200" height="200" fill="url(#g)" />
        <animate xlink:href="#r" attributeName="x" from="-200" to="200" dur="1s" repeatCount="indefinite" />
      </svg>
    `)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dim background */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 25 }}
            className="fixed top-0 right-0 h-[100dvh] w-[92vw] sm:w-[380px] bg-white z-[9999] shadow-2xl flex flex-col border-l border-[#e4d5b5]"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b flex justify-between items-center bg-[#FCF8F3] shrink-0">
              <h3 className="text-xl font-bold text-[#B28C34] tracking-wide">Perfume Cart</h3>
              <button
                onClick={onClose}
                className="text-3xl leading-none font-light text-[#4a3b25] hover:text-[#B28C34] transition"
                aria-label="Close cart"
              >
                &times;
              </button>
            </div>

            {/* Cart items (scrollable section) */}
            <div className="px-6 py-4 flex-1 overflow-y-auto overscroll-contain">
              {cartCount === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12 text-[#B28C34] text-lg font-medium"
                >
                  Your cart is empty!
                </motion.div>
              ) : (
                cartItems.map((item, i) => {
                  const imageSrc = item.image?.original || item.image

                  return (
                    <motion.div
                      key={`${item.id}-${item.size}-${i}`}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40 }}
                      className="flex gap-4 mb-6 border-b pb-4"
                    >
                      {/* Product image */}
                      <div className="w-16 h-16 flex-shrink-0 rounded-md bg-[#FCF8F3] flex items-center justify-center border shadow-sm overflow-hidden">
                        <Image
                          src={imageSrc}
                          alt={item.name}
                          width={70}
                          height={70}
                          className="rounded-md object-cover"
                          placeholder="blur"
                          blurDataURL={shimmer}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-center">
                          <Link
                            href={`/product/${item.slug}`}
                            onClick={onClose}
                            className="block font-serif font-semibold text-[#33270a] hover:text-[#B28C34] transition-colors leading-snug"
                          >
                            {item.name}
                          </Link>
                          <button
                            onClick={() => removeFromCart(item.id, item.size)}
                            className="ml-2 p-1 text-gray-600 hover:text-red-600 transition"
                            aria-label="Remove item"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                        <p className="text-xs text-[#665933]">Size: {item.size}</p>
                        <p className="font-semibold text-[#B28C34] mt-1">
                          ₹{formatAmount(item.price * item.quantity).toLocaleString()}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))
                            }
                            className="w-6 h-6 rounded-full border border-[#B28C34] text-[#B28C34] flex items-center justify-center hover:bg-[#B28C34] hover:text-white transition"
                          >
                            –
                          </button>
                          <span className="px-3 py-1 rounded bg-[#FDF7E2] text-[#33270a] text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                            className="w-6 h-6 rounded-full border border-[#B28C34] text-[#B28C34] flex items-center justify-center hover:bg-[#B28C34] hover:text-white transition"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>

            {/* Footer (always visible) */}
            {cartCount > 0 && (
              <div className="border-t px-6 py-5 bg-[#FCF8F3] sticky bottom-0">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[#665933] font-medium">Subtotal</span>
                  <span className="font-bold text-lg text-[#B28C34]">
                    ₹{formatAmount(subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <button
                  className="w-full py-3 rounded-lg bg-[#1f1c1a] text-white font-semibold shadow-sm hover:shadow-md transition text-sm"
                  onClick={handleCheckout}
                >
                  PROCEED TO CHECKOUT
                </button>

                <Link
                  href="/Cart"
                  onClick={onClose}
                  className="mt-3 block text-center underline text-[#7e4343] hover:text-[#9c5516] text-sm"
                >
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function MiniCart({ isOpen, onClose }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return createPortal(<MiniCartDrawer isOpen={isOpen} onClose={onClose} />, document.body)
}
