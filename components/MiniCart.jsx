'use client'
import { useCart } from '../app/context/cartcontext'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function MiniCart({ isOpen, onClose }) {
  const { cartItems, removeFromCart, updateQuantity, cartCount } = useCart()
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
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
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[380px] max-w-[92vw] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b flex justify-between items-center bg-[#FCF8F3]">
              <h3 className="text-xl font-bold text-[#B28C34] tracking-wide">Perfume Cart</h3>
              <button
                onClick={onClose}
                className="text-3xl leading-none font-light text-[#4a3b25] hover:text-[#B28C34] transition"
              >
                &times;
              </button>
            </div>

            {/* Items */}
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
                cartItems.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    className="flex gap-4 mb-6 border-b pb-4"
                  >
                    {/* Image */}
                    <div className="w-16 h-16 flex-shrink-0 rounded-md bg-[#FCF8F3] flex items-center justify-center border shadow-sm">
                      <Image
                        src={item.image}
                        width={64}
                        height={64}
                        alt={item.name}
                        className="object-contain rounded-md"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <Link
                        href={`/product/${item.id}`}
                        onClick={onClose}
                        className="block font-serif font-semibold text-[#33270a] hover:text-[#B28C34] transition-colors leading-snug"
                      >
                        {item.name}
                      </Link>
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

                      <button
                        onClick={() => removeFromCart(item.id, item.size)}
                        className="text-xs underline text-red-600 hover:text-red-700 mt-2"
                      >
                        Remove
                      </button>
                    </div>
                  </motion.div>
                ))
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
                <button className="w-full py-3 rounded-lg bg-gradient-to-r from-[#242121] to-[#1a1919] text-white font-semibold shadow-sm hover:shadow-lg transition text-sm">
                  Proceed to Checkout
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
