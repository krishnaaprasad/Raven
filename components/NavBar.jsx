'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../app/context/cartcontext';
import MiniCart from './MiniCart';
import dynamic from 'next/dynamic';
import { useSession, signOut } from 'next-auth/react';
import {
  ShoppingBagIcon,
  UserIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion'; // ✨ animation

const AuthModal = dynamic(() => import('../app/auth/modal'), { ssr: false });

export default function NavBar() {
  const [showMiniCart, setShowMiniCart] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [animateCart, setAnimateCart] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const dropdownRef = useRef(null);
  const { cartCount } = useCart();
  const { data: session } = useSession();

  useEffect(() => {
    if (cartCount > 0) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 600);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowAccountMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className="relative bg-[#FAF5E8]/95 backdrop-blur-md border-b border-[#e4d5b5] top-0 z-[999] shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative flex h-14 items-center justify-between">

            {/* SHOP (Mobile) */}
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="flex items-center sm:hidden"
            >
              <Link href="/product/rebel">
                <button className="flex items-center justify-center min-w-[80px] h-8 px-4 rounded-md bg-[#f8f3e4] text-[#1A1A1A] text-[12px] font-semibold tracking-wider border border-[#e3d2a8] hover:bg-[#f0e5c8] active:scale-95 transition-all duration-300">
                  SHOP
                </button>
              </Link>
            </motion.div>

            {/* CENTER (Logo) */}
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
              className="flex justify-center w-full absolute left-0 right-0 pointer-events-none"
            >
              <Link href="/" className="pointer-events-auto">
                <Image
                  src="/logo.png"
                  alt="Raven Fragrance Logo"
                  width={52}
                  height={18}
                  className="h-[18px] sm:h-[21px] w-auto object-contain transition-transform duration-300 hover:scale-[1.03]"
                  priority
                />
              </Link>
            </motion.div>

            {/* RIGHT (Icons + Desktop Shop Button) */}
            <div className="ml-auto flex items-center space-x-3 sm:space-x-4">

              {/* SHOP NOW (Desktop) */}
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className="hidden sm:block"
            >
              <Link href="/product/rebel">
                <button className="flex items-center justify-center min-w-[130px] h-9 px-5 rounded-md bg-[#f8f3e4] text-[#1A1A1A] text-[13px] font-semibold tracking-wider border border-[#e3d2a8] hover:bg-[#f0e5c8] active:scale-95 transition-all duration-300">
                  SHOP NOW
                </button>
              </Link>
            </motion.div>
              {/* Account/Login */}
              {!session ? (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-transparent border-none outline-none"
                  aria-label="Login/Register"
                >
                  <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#191919] hover:text-[#B4933A] cursor-pointer transition-transform hover:scale-110" />
                </button>
              ) : (
                <div ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setShowAccountMenu((prev) => !prev)}
                    className="flex items-center space-x-1 text-[#191919] hover:text-[#B4933A] transition-all duration-300"
                    aria-label="My Account Menu"
                  >
                    <UserIcon className="h-6 w-6 sm:h-6 sm:w-6" />
                    <ChevronDownIcon className="h-5 w-5 mt-[1px]" />
                  </button>

                  {showAccountMenu && (
                    <div
                      className="absolute right-0 top-8 w-44 bg-white/95 backdrop-blur-md border border-[#e7dabf] rounded-xl shadow-[0_8px_18px_rgba(0,0,0,0.15)] py-2 z-[9999] animate-fadeIn"
                      onMouseEnter={() => setShowAccountMenu(true)}
                      onMouseLeave={() => setShowAccountMenu(false)}
                    >

                      <Link
                        href="/my-account"
                        className="block px-4 py-2 text-[15px] font-medium text-[#191919] hover:text-[#B4933A] hover:bg-[#FAF5E8] rounded-md transition-colors duration-200"
                        onClick={() => setShowAccountMenu(false)}
                      >
                        My Account
                      </Link>
                      <button
                        onClick={() => {
                          setShowAccountMenu(false);
                          signOut();
                        }}
                        className="w-full text-left block px-4 py-2 text-[15px] font-medium text-[#191919] hover:text-[#B4933A] hover:bg-[#FAF5E8] rounded-md transition-colors duration-200"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Cart */}
              <button
                aria-label="View Cart"
                id="cart-icon"
                className="relative cursor-pointer bg-transparent border-none outline-none"
                onClick={() => setShowMiniCart(true)}
                type="button"
              >
                <ShoppingBagIcon
                  className={`h-6 w-6 sm:h-6 sm:w-6 text-[#191919] hover:text-[#B4933A] transition-transform duration-500 ${
                    animateCart ? 'animate-bounce' : ''
                  }`}
                />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 rounded-full bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>

              <MiniCart
                isOpen={showMiniCart}
                onClose={() => setShowMiniCart(false)}
              />
            </div>
          </div>
        </div>
      </nav>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}
