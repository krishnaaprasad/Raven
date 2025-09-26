'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '../context/cartcontext'
import { motion, AnimatePresence } from 'framer-motion'

export default function CartPage() {
  const { cartItems, removeFromCart, clearCart, cartCount, updateQuantity } = useCart()
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (!cartItems.length) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#FCF8F3] px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, type: 'spring' }}
          className="text-center px-8 py-10 rounded-2xl bg-white shadow-lg border border-[#e6decf]"
        >
          <h1 className="font-serif font-bold text-xl mb-3 text-[#8B6C3A]">Your cart is empty</h1>
          <Link
            href="/product"
            className="text-[#B28C34] underline font-medium hover:text-[#9a7730] transition-colors"
          >
            Discover our perfumes
          </Link>
        </motion.div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-[#FCF8F3] flex flex-col items-center px-4 py-10">
      <motion.h1
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl md:text-3xl font-serif font-bold mb-8 text-[#6B4B1E] tracking-wide"
      >
        Your Shopping Cart
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-[#f0e7d9] p-6 md:p-8"
      >
        <AnimatePresence>
          {cartItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, type: 'spring' }}
              className="flex flex-col sm:flex-row items-center justify-between py-6 border-b border-[#f1e6d8] gap-5"
            >
              {/* Product Info */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-20 h-20 flex-shrink-0 rounded-xl bg-[#FCF8F3] flex items-center justify-center border border-[#e6decf] shadow-sm"
                >
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="object-contain rounded-lg"
                    />
                  )}
                </motion.div>
                <div>
                  <Link
                    href={`/product`}
                    className="font-serif font-semibold text-[#3a2c19] hover:text-[#B28C34] transition-colors cursor-pointer text-lg"
                  >
                    {item.name}
                  </Link>
                  <div className="text-xs text-[#857255] mt-1">Size: {item.size}</div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-[#d6c7a1] bg-[#fdfbf6] hover:bg-[#f1e6d8] text-[#6B4B1E] text-lg font-bold shadow-sm transition"
                    >
                      −
                    </button>
                    <span className="px-4 py-1 rounded-full bg-[#FAF6EF] border border-[#e6decf] text-shadow-md font-medium text-[#4a3721] shadow-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-[#d6c7a1] bg-[#fdfbf6] hover:bg-[#f1e6d8] text-[#6B4B1E] text-lg font-bold shadow-sm transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Price & Remove */}
              <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                <span className="font-semibold text-[#B28C34] text-lg md:text-xl">
                  ₹{item.price * item.quantity}
                </span>
                <motion.button
                  whileTap={{ scale: 0.94, color: '#b22222' }}
                  className="text-xs text-red-600 hover:text-red-700 underline transition font-semibold"
                  onClick={() => removeFromCart(item.id, item.size)}
                >
                  Remove
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Total */}
        <div className="flex justify-between items-center py-6 mt-4 border-t border-[#f1e6d8]">
          <span className=" font-semibold text-[#3a2c19] text-lg">{`Total (${cartCount} items):`}</span>
          <motion.span
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.5 }}
            className="font-bold text-2xl text-[#B28C34] tracking-wide"
          >
            ₹{totalPrice}
          </motion.span>
        </div>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 4px 24px #00000022' }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-[#2a1f18] to-[#1a1919] text-[#fafafa] font-semibold shadow-md hover:shadow-lg transition text-base tracking-wide"
          >
            Proceed to Checkout
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, backgroundColor: '#fdf7eb' }}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-3 rounded-lg border border-[#E6D8A5] text-[#3a2c19] font-medium hover:bg-[#fdf7eb] transition text-base"
            onClick={clearCart}
          >
            Clear Cart
          </motion.button>
        </div>
      </motion.div>
    </section>
  )
}
