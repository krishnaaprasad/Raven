'use client'

import { useCart } from '../app/context/cartcontext'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrashIcon } from '@heroicons/react/24/outline'

function MiniCartDrawer({ isOpen, onClose }) {
  const { cartItems, removeFromCart, updateQuantity, cartCount } = useCart()
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const router = useRouter()

  const handleCheckout = () => {
    onClose?.()
    router.push('/checkout')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
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
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 h-screen w-[92vw] sm:w-[380px] bg-white z-[9999] shadow-2xl flex flex-col outline-none"
            style={{ boxSizing: 'border-box', borderLeft: '1px solid #e4d5b5' }}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b flex justify-between items-center bg-[#FCF8F3]">
              <h3 className="text-xl font-bold text-[#B28C34] tracking-wide">Perfume Cart</h3>
              <button
                onClick={onClose}
                className="text-3xl leading-none font-light text-[#4a3b25] hover:text-[#B28C34] transition"
                aria-label="Close cart"
              >
                &times;
              </button>
            </div>

            {/* Items Section */}
            <div className="px-6 py-4 flex-1 overflow-y-auto">
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
                  // Fix potential image src issues, fallback to empty string if undefined
                  const imageSrc = item.image || ''

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40 }}
                      className="flex gap-4 mb-6 border-b pb-4"
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 flex-shrink-0 rounded-md bg-[#FCF8F3] flex items-center justify-center border shadow-sm">
                        {imageSrc ? (
                          <Image
                            src={imageSrc}
                            width={64}
                            height={64}
                            alt={item.name}
                            className="object-contain rounded-md"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-md" />
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-center">
                          <Link
                            href={`/product/${item.id}`}
                            onClick={onClose}
                            className="block font-serif font-semibold text-[#33270a] hover:text-[#B28C34] transition-colors leading-snug"
                          >
                            {item.name}
                          </Link>
                          {/* Delete Icon Button */}
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
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))}
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

            {/* Footer */}
            {cartCount > 0 && (
              <div className="border-t px-6 py-5 bg-[#FCF8F3]">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[#665933] font-medium">Subtotal</span>
                  <span className="font-bold text-lg text-[#B28C34]">
                    ₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <button
                  className="w-full py-3 rounded-lg bg-[#1f1c1a] text-white font-semibold shadow-sm hover:shadow-md transition text-sm"
                  onClick={() => { onClose(); router.push('/checkout') }}
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

  useEffect(() => {
    setMounted(true)
  }, [])

  // SSR check: only render portal on client
  if (!mounted) return null

  return createPortal(
    <MiniCartDrawer isOpen={isOpen} onClose={onClose} />,
    document.body
  )
}
