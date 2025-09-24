'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '../context/cartcontext'

export default function CartPage() {
  const { cartItems, removeFromCart, clearCart, cartCount } = useCart()

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (!cartItems.length) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#FCF8F3] px-4">
        <div className="text-center px-6 py-8 rounded-xl bg-white shadow-md">
          <h1 className="font-bold text-lg mb-2 text-[#B28C34]">Your cart is empty!</h1>
          <Link href="/product" className="text-[#B28C34] underline font-medium">
            Browse products
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-[#FCF8F3] flex flex-col items-center px-4 py-8">
      <h1 className="text-xl md:text-2xl font-bold mb-6 text-[#B28C34]">Your Cart</h1>
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-4 md:p-6">
        {cartItems.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-4 border-b border-[#f5e8d4]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 flex-shrink-0 rounded-md bg-[#FCF8F3] flex items-center justify-center border">
                {item.image && (
                  <Image src={item.image} alt={item.name} width={56} height={56} className="object-contain rounded-md" />
                )}
              </div>
              <div>
                <div className="font-serif font-semibold text-[#33270a]">{item.name}</div>
                <div className="text-xs text-[#665933]">Size: {item.size}</div>
                <div className="text-xs text-[#665933]">Qty: {item.quantity}</div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="font-semibold text-[#B28C34] text-base md:text-lg">₹{item.price * item.quantity}</span>
              <button
                className="text-xs text-red-600 hover:text-red-700 underline transition"
                onClick={() => removeFromCart(item.id, item.size)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <div className="flex justify-between items-center py-4 mt-3 border-t border-[#f5e8d4]">
          <span className="font-semibold text-[#33270a]">Total ({cartCount} items):</span>
          <span className="font-bold text-xl md:text-2xl text-[#B28C34]">₹{totalPrice}</span>
        </div>
        <div className="flex flex-col md:flex-row gap-3 mt-6">
          {/* Softer gold button */}
          <button className="flex-1 px-4 py-2 md:py-3 rounded-lg bg-gradient-to-r from-[#242121] to-[#1a1919] text-[#fafafa] font-bold shadow-sm hover:shadow-md transition-transform hover:scale-105 text-sm md:text-base">
            Proceed to Checkout
          </button>
          {/* Subtle clear cart */}
          <button
            className="px-4 py-2 md:py-3 rounded-lg border border-[#E6D8A5] text-[#000000] font-medium hover:bg-[#FDF7E2] transition text-sm md:text-base"
            onClick={clearCart}
          >
            Clear Cart
          </button>
        </div>
      </div>
    </section>
  )
}
