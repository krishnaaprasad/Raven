'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../context/cartcontext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MdDelete } from 'react-icons/md';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();
  const [discount, setDiscount] = useState('');

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (!cartItems.length) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#fcfbf8] px-4 font-[Manrope,sans-serif]">
        <div className="text-center p-8 rounded-xl bg-white shadow-md border border-[#e7e1cf]">
          <h1 className="text-lg font-semibold mb-3 text-[#1b180d]">
            Your cart is empty
          </h1>
          <Link
            href="/product/rebel"
            className="text-[#9a864c] underline text-sm hover:text-[#1b180d] transition"
          >
            Discover our perfumes
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fcfbf8] font-[Manrope,sans-serif] text-[#1b180d] px-4 sm:px-6 lg:px-8 py-6">
      {/* 🏷 Page Title */}
      <h1 className="text-[30px] sm:text-[30px] font-extrabold mb-6 text-[#1b180d] tracking-tight">
        My Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* 🧴 Left Column - Cart Items */}
        <div className="lg:col-span-2 space-y-5">
          {cartItems.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-white border border-[#e7e1cf] rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              {/* Product Info */}
              <div className="flex items-start gap-4 flex-grow">
                <div className="h-[90px] w-[90px] rounded-lg overflow-hidden border border-[#e7e1cf]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={90}
                    height={90}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                </div>

                <div>
                  <Link
                    href={`/product/${item.slug}`}
                    className="block text-base sm:text-[17px] font-semibold hover:text-[#b28c34] transition"
                  >
                    {item.name}
                  </Link>
                  <p className="text-sm text-[#9a864c] mt-0.5">
                    ₹{item.price}.00
                  </p>
                  <p className="text-sm text-[#9a864c]">{item.size}</p>
                </div>
              </div>

              {/* Quantity + Controls */}
              <div className="flex items-center gap-6 sm:gap-8 mt-3 sm:mt-0">
                <div className="flex items-center justify-center gap-2 text-[#1b180d] bg-[#f8f6f1] rounded-full px-3 py-1 border border-[#e7e1cf]">
                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.size, Math.max(item.quantity - 1, 1))
                    }
                    className="h-7 w-7 flex items-center justify-center rounded-full bg-[#f3f0e7] hover:bg-[#e7dec7] text-sm font-medium"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-medium text-sm leading-none">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.size, item.quantity + 1)
                    }
                    className="h-7 w-7 flex items-center justify-center rounded-full bg-[#f3f0e7] hover:bg-[#e7dec7] text-sm font-medium"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <p className="text-[#1b180d] font-semibold text-right w-16 hidden sm:block">
                  ₹{item.price * item.quantity}.00
                </p>

                <button
                  className="text-[#9a864c] hover:text-[#1b180d] transition"
                  onClick={() => removeFromCart(item.id, item.size)}
                  aria-label="Remove item"
                >
                  <MdDelete size={18} />
                </button>
              </div>
            </div>
          ))}

          {/* Continue Shopping */}
          <div className="text-center mt-6">
            <Link
              href="/product/rebel"
              className="text-[#9a864c] hover:text-[#1b180d] underline text-sm font-medium transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* 💳 Right Column - Order Summary */}
        <aside className="border border-[#e7e1cf] rounded-lg p-6 space-y-6 sticky top-24 bg-white shadow-sm">
          <h3 className="text-xl font-bold">Order Summary</h3>

          {/* Totals */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#9a864c]">Subtotal</span>
              <span className="text-[#1b180d] font-medium">
                ₹{totalPrice}.00
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9a864c]">Shipping</span>
              <span className="text-[#1b180d]">Calculated at next step</span>
            </div>
          </div>

          {/* Discount Input */}
          <div>
            <label
              htmlFor="discount-code"
              className="block text-sm font-semibold text-[#1b180d] mb-2"
            >
              Discount Code
            </label>
            <div className="flex gap-2">
              <input
                id="discount-code"
                type="text"
                placeholder="Enter code"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="flex-grow rounded-md border border-[#e7e1cf] bg-[#f3f0e7] text-sm py-2 px-3 focus:ring-1 focus:ring-[#eebd2b] outline-none"
              />
              <button
                type="button"
                className="px-4 py-2 rounded-md bg-[#eebd2b]/30 text-[#1b180d] font-semibold text-sm hover:bg-[#eebd2b]/50 transition"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Order Total */}
          <div className="border-t border-[#e7e1cf] pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">Order Total</span>
              <span className="text-2xl font-bold">₹{totalPrice}.00</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={() => router.push('/checkout')}
            className="w-full bg-[#eebd2b] text-[#1b180d] py-3 rounded-md font-bold text-base hover:bg-[#d8a91a] transition-all duration-300"
          >
            Proceed to Checkout
          </button>

          {/* Payment Logos (Indian / Cashfree-compatible) */}
          <div className="flex items-center justify-center gap-4 pt-3 opacity-90 sizes:h-6">
            {[
              {
                src: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png',
                alt: 'Visa',
              },
              {
                src: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/RuPay.svg',
                alt: 'RuPay',
              },
              {
                src: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg',
                alt: 'UPI',
              }
            ].map((logo, i) => (
              <img
                key={i}
                src={logo.src}
                alt={logo.alt}
                className="h-5 w-auto hover:opacity-100 transition"
              />
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
