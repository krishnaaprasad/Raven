'use client'
import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '../app/context/cartcontext'
import MiniCart from './MiniCart'
import dynamic from 'next/dynamic'

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react'
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingBagIcon,
  UserIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'

const AuthModal = dynamic(() => import('../app/auth/modal'), { ssr: false })

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/product' },
  { name: 'Contact Us', href: '/contact' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function NavBar() {
  const [showSearch, setShowSearch] = useState(false)
  const searchRef = useRef(null)
  const { cartCount } = useCart()
  const [animateCart, setAnimateCart] = useState(false)
  const [showMiniCart, setShowMiniCart] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (cartCount > 0) {
      setAnimateCart(true)
      const timer = setTimeout(() => setAnimateCart(false), 600)
      return () => clearTimeout(timer)
    }
  }, [cartCount])

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      <Disclosure as="nav" className="bg-[#FAF5E8] border-b border-[#e4d5b5]">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="relative flex h-13 items-center justify-between">
                {/* Left: Hamburger for mobile */}
                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                  <DisclosureButton className="inline-flex items-center justify-center rounded-md p-2 text-[#B4933A] hover:text-black focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black">
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" />
                    )}
                  </DisclosureButton>
                </div>

                {/* Mobile search bar dropdown */}
                {showSearch && (
                  <div
                    ref={searchRef}
                    className="absolute top-12 left-0 right-0 z-10 bg-white px-4 py-2 border-t border-gray-200 shadow-sm sm:hidden"
                  >
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                )}

                {/* Middle: Logo & Nav */}
                <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                  <div className="flex flex-shrink-0 items-center">
                    <Link href="/" className="flex items-center">
                      <Image
                        src="/logo.png"
                        alt="Raven Fragrance Logo"
                        width={80}
                        height={20}
                        className="h-5 sm:h-5 w-auto"
                        priority={true}
                        draggable={false}
                      />
                    </Link>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-6">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="
                          relative
                          text-base font-medium text-[#191919]
                          hover:text-[#B4933A]
                          after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:bg-[#B4933A] after:origin-center
                          after:scale-x-0 after:w-full after:transition-transform after:duration-300
                          hover:after:scale-x-100 hover:after:left-0
                        "
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Right side icons */}
                <div className="flex items-center space-x-4">
                  {/* Desktop search */}
                  <div className="hidden md:block w-64 relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-[#B4933A]" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm text-[#191919] focus:outline-none focus:ring-1 focus:ring-[#B4933A]"
                    />
                  </div>

                  {/* Mobile search icon */}
                  <button
                    onClick={() => setShowSearch((prev) => !prev)}
                    className="block sm:hidden text-[#191919] hover:text-[#B4933A]"
                  >
                    <MagnifyingGlassIcon className="h-6 w-6" />
                  </button>

                  {/* Login modal trigger */}
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-transparent border-none outline-none"
                    aria-label="Login/Register"
                  >
                    <UserIcon className="h-6 w-6 text-[#191919] hover:text-[#B4933A] cursor-pointer" />
                  </button>

                  {/* Cart */}
                  <button
                    aria-label="View Cart"
                    id="cart-icon"
                    className="relative cursor-pointer bg-transparent border-none outline-none"
                    onClick={() => setShowMiniCart(true)}
                    type="button"
                  >
                    <ShoppingBagIcon
                      className={`h-6 w-6 text-[#191919] hover:text-[#B4933A] transition-transform duration-500 ${animateCart ? 'animate-bounce' : ''}`}
                    />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 rounded-full bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center font-bold">
                        {cartCount}
                      </span>
                    )}
                  </button>
                  <MiniCart isOpen={showMiniCart} onClose={() => setShowMiniCart(false)} />
                </div>
              </div>
            </div>

            {/* Mobile Nav Links */}
            <DisclosurePanel className="sm:hidden">
              <div className="space-y-1 px-2 pt-2 pb-3">
                {navigation.map((item) => (
                  <DisclosureButton
                    key={item.name}
                    as="a"
                    href={item.href}
                    className="
                      block rounded-md px-3 py-2 text-base font-semibold text-[#191919] hover:text-[#B4933A]
                      relative
                      after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:bg-[#B4933A] after:origin-center
                      after:scale-x-0 after:w-full after:transition-transform after:duration-300
                      hover:after:scale-x-100 hover:after:left-0
                    "
                  >
                    {item.name}
                  </DisclosureButton>
                ))}
              </div>
            </DisclosurePanel>
          </>
        )}
      </Disclosure>
      {/* Auth Modal rendered at top level */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  )
}
