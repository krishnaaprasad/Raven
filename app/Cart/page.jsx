'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '../context/cartcontext'
import { motion, AnimatePresence } from 'framer-motion'

export default function CartPage() {
  const { cartItems, removeFromCart, clearCart, cartCount } = useCart()
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (!cartItems.length) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#FCF8F3] px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, type: 'spring' }}
          className="text-center px-6 py-8 rounded-xl bg-white shadow-lg"
        >
          <h1 className="font-bold text-lg mb-2 text-[#B28C34]">Your cart is currently empty!</h1>
          <Link
            href="/product"
            className="text-[#B28C34] underline font-medium transition-colors hover:text-[#E6D8A5]"
          >
            Back to shopping
          </Link>
        </motion.div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-[#FCF8F3] flex flex-col items-center px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-xl md:text-2xl font-bold mb-6 text-[#B28C34]"
      >
        Your Cart
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-4 md:p-6"
      >
        <AnimatePresence>
          {cartItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, type: 'spring' }}
              className="flex items-center justify-between py-4 border-b border-[#f5e8d4] group"
            >
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.09, boxShadow: "0 4px 24px #B28C3422" }}
                  className="w-14 h-14 flex-shrink-0 rounded-md bg-[#FCF8F3] flex items-center justify-center border transition-shadow shadow-sm"
                >
                  {item.image && (
                    <Image src={item.image} alt={item.name} width={56} height={56} className="object-contain rounded-md" />
                  )}
                </motion.div>
                <div>
                  <Link
                    href={`/product`}
                    className="font-serif font-semibold text-[#33270a] group-hover:text-[#B28C34] transition-colors cursor-pointer"
                  >
                    {item.name}
                  </Link>
                  <div className="text-xs text-[#665933]">Size: {item.size}</div>
                  <div className="text-xs text-[#665933]">Qty: {item.quantity}</div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="font-semibold text-[#B28C34] text-base md:text-lg">{`₹${item.price * item.quantity}`}</span>
                <motion.button
                  whileTap={{ scale: 0.94, color: "#b22222" }}
                  className="text-xs text-red-600 hover:text-red-700 underline transition font-semibold"
                  onClick={() => removeFromCart(item.id, item.size)}
                >
                  Remove
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="flex justify-between items-center py-4 mt-3 border-t border-[#f5e8d4]">
          <span className="font-semibold text-[#33270a]">{`Total (${cartCount} items):`}</span>
          <motion.span
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.5 }}
            className="font-bold text-xl md:text-2xl text-[#B28C34] tracking-wide"
          >
            ₹{totalPrice}
          </motion.span>
        </div>
        <div className="flex flex-col md:flex-row gap-3 mt-6">
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 4px 24px #24212155" }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-4 py-2 md:py-3 rounded-lg bg-gradient-to-r from-[#242121] to-[#1a1919] text-[#fafafa] font-bold shadow-sm hover:shadow-lg transition text-sm md:text-base"
          >
            Proceed to Checkout
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, backgroundColor: "#FDF7E2" }}
            whileTap={{ scale: 0.97 }}
            className="px-4 py-2 md:py-3 rounded-lg border border-[#E6D8A5] text-[#000000] font-medium hover:bg-[#FDF7E2] transition text-sm md:text-base"
            onClick={clearCart}
          >
            Clear Cart
          </motion.button>
        </div>
      </motion.div>
    </section>
  )
}
