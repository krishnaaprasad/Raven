'use client';

import Link from 'next/link';
import Image from 'next/image';
import usePageMetadata from '../hooks/usePageMetadata';
import { useCart } from '../context/cartcontext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MdDelete } from 'react-icons/md';

export default function CartPage() {
  usePageMetadata(
    'Shopping Cart - Raven Fragrance',
    'Review your selected Raven Fragrance perfumes, manage quantities, and proceed to secure checkout.'
  );

  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();
  const [discount, setDiscount] = useState('');
  
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (!cartItems.length) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-(--theme-bg) px-4 font-[Manrope,sans-serif] transition-colors duration-500">
        <div className="text-center p-8 border border-(--theme-border) bg-(--theme-soft)">
          <h1 className="text-lg font-semibold mb-3 text-(--theme-text)">
            Your cart is empty
          </h1>
          <Link
            href="/collection"
            className="text-sm underline text-(--theme-muted) hover:text-(--theme-text) transition"
          >
            Discover our perfumes
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-(--theme-bg) font-[Manrope,sans-serif] text-(--theme-text) px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-500">
      
      {/* Page Title */}
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 tracking-tight">
        My Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-(--theme-soft) border border-(--theme-border) p-5 transition"
            >
              {/* Product Info */}
              <div className="flex items-start gap-5 grow">
                <div className="h-[95px] w-[95px] overflow-hidden border border-(--theme-border)">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={95}
                    height={95}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                </div>

                <div>
                  <Link
                    href={`/product/${item.slug}`}
                    className="block text-base sm:text-lg font-semibold hover:opacity-70 transition"
                  >
                    {item.name}
                  </Link>

                  <p className="text-sm text-(--theme-muted) mt-1">
                    ₹{item.price}.00
                  </p>

                  <p className="text-sm text-(--theme-muted)">
                    {item.size}
                  </p>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 border border-(--theme-border) px-3 py-1">
                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.size, Math.max(item.quantity - 1, 1))
                    }
                    className="h-7 w-7 flex items-center justify-center text-sm font-medium hover:bg-(--theme-bg) cursor-pointer"
                  >
                    −
                  </button>

                  <span className="w-6 text-center text-sm">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.size, item.quantity + 1)
                    }
                    className="h-7 w-7 flex items-center justify-center text-sm font-medium hover:bg-(--theme-bg) cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <p className="font-semibold text-right w-20 hidden sm:block">
                  ₹{item.price * item.quantity}.00
                </p>

                <button
                  className="text-(--theme-muted) hover:text-(--theme-text) transition cursor-pointer"
                  onClick={() => removeFromCart(item.id, item.size)}
                >
                  <MdDelete size={18} />
                </button>
              </div>
            </div>
          ))}

          {/* Continue Shopping */}
          <div className="text-center mt-6">
            <Link
              href="/collection"
              className="text-sm underline text-(--theme-muted) hover:text-(--theme-text) transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right Column - Summary */}
        <aside className="border border-(--theme-border) bg-(--theme-soft) p-6 space-y-6 sticky top-24">

          <h3 className="text-xl font-semibold">
            Order Summary
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-(--theme-muted)">Subtotal</span>
              <span className="font-medium">
                ₹{totalPrice}.00
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-(--theme-muted)">Shipping</span>
              <span>Calculated at next step</span>
            </div>
          </div>

          {/* Discount */}
          {/* <div>
            <label
              htmlFor="discount-code"
              className="block text-sm font-semibold mb-2"
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
                className="grow border border-(--theme-border) bg-(--theme-bg) text-sm py-2 px-3 focus:outline-none"
              />

              <button
                type="button"
                className="px-4 py-2 border border-(--theme-border) text-sm font-semibold hover:bg-(--theme-bg) transition"
              >
                Apply
              </button>
            </div>
          </div> */}

          {/* Total */}
          <div className="border-t border-(--theme-border) pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Order Total</span>
              <span className="text-2xl font-bold">
                ₹{totalPrice}.00
              </span>
            </div>
          </div>

          {/* Checkout */}
          <button
            onClick={() => router.push('/checkout')}
            className="w-full border bg-(--theme-bg) border-(--theme-border) py-3 font-semibold hover:bg-(--theme-soft) transition cursor-pointer"
          >
            Proceed to Checkout
          </button>

          {/* Payment Logos */}
          <div className="flex items-center justify-center gap-4 pt-4 opacity-80">
            {[
              'https://upload.wikimedia.org/wikipedia/commons/9/98/Visa_Inc._logo_%282005%E2%80%932014%29.svg',
              'https://upload.wikimedia.org/wikipedia/commons/d/d1/RuPay.svg',
              'https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg'
            ].map((src, i) => (
              <img
                key={i}
                src={src}
                alt="Payment"
                className="h-5 w-auto"
              />
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
