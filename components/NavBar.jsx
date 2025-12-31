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
import { motion,AnimatePresence } from 'framer-motion';
import { usePathname } from "next/navigation"; 
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import LogoText from '@/components/LogoText';




const AuthModal = dynamic(() => import('../app/auth/modal'), { ssr: false });

export default function NavBar() {
  const pathname = usePathname(); // ⭐ ADDED
  const router = useRouter();
  if (pathname.startsWith("/admin")) return null;
  
  const [showMiniCart, setShowMiniCart] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [animateCart, setAnimateCart] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const dropdownRef = useRef(null);
  const { cartCount, openCart } = useCart();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [pastMarquee, setPastMarquee] = useState(false);
  const isHome = pathname === "/";
  const MARQUEE_HEIGHT = 40;

 

  const handleClick = () => {
    if (window.location.pathname !== "/") {
      router.push("/#why-choose-raven");
    } else {
      document
        .getElementById("why-choose-raven")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

useEffect(() => {
  const handleScroll = () => {
    const y = window.scrollY;

    if (isHome) {
      setPastMarquee(y > MARQUEE_HEIGHT);

      const heroThreshold = window.innerHeight - 80;
      setIsScrolled(y > heroThreshold);
    } else {
      // Other pages: no marquee, always solid navbar
      setPastMarquee(true);
      setIsScrolled(true);
    }
  };

  window.addEventListener("scroll", handleScroll);
  handleScroll();

  return () => window.removeEventListener("scroll", handleScroll);
}, [isHome]);


 const showSolid = !isHome || isScrolled;


  return (
    <>
   <nav
  className={`fixed left-0 right-0 z-1000 transition-all duration-500 ease-out
    ${isHome && !pastMarquee ? "top-10" : "top-0"}
    ${
      showSolid
        ? "bg-[#fcfbf8]/95 backdrop-blur-md border-b border-[#e7e1cf] shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
        : "bg-transparent"
    }
  `}
>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative flex h-12 items-center justify-between">

            {/* SHOP (Mobile) */}
            {/* HAMBURGER (Mobile) */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label="Open menu"
                className="p-2"
              >
                <Bars3Icon
  className={`h-6 w-6 transition ${
    showSolid ? "text-[#1b180d]" : "text-white"
  }`}
/>

              </button>
            </div>
          

            {/* CENTER (Logo) */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
              className="flex justify-center w-full absolute left-0 right-0 pointer-events-none mt-0.5"
            >
              <Link href="/" className="pointer-events-auto">
                <LogoText
  size="lg"
  className={`transition-colors duration-500 ${
    showSolid ? "text-[#1b180d]" : "text-white"
  }`}
/>

              </Link>

            </motion.div>

            {/* RIGHT (Icons + Desktop Shop Button) */}
            <div className="ml-auto flex items-center space-x-4 sm:space-x-5">

              {/* SHOP NOW (Desktop)
              <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                className="hidden sm:block"
              >
                <Link href="/collection">
                  <button
                    className="relative group flex items-center justify-center min-w-[130px] h-10 px-6 rounded-md overflow-hidden text-sm font-semibold tracking-wide uppercase text-[#1b180d] transition-all shadow-[0_4px_10px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_15px_rgba(0,0,0,0.15)] font-[Manrope,sans-serif] cursor-pointer"
                    style={{
                      background:
                        'linear-gradient(45deg, #a66d30, #ffe58e 50%, #e0b057)',
                    }}
                  >
                    <span className="relative z-10">SHOP NOW</span>
                    {/* Shine Effect 
                    <span className="absolute top-0 left-[-80%] w-[60%] h-full bg-linear-to-tr from-transparent via-white/50 to-transparent rotate-25 opacity-0 group-hover:opacity-100 animate-shine-slow"></span>
                  </button>
                </Link>
              </motion.div>*/}

              {/* Account/Login */}
              {!session ? (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-transparent border-none outline-none"
                  aria-label="Login/Register"
                >
                  <UserIcon
  className={`h-5 w-5 sm:h-6 sm:w-6 transition-transform hover:scale-110 ${
    showSolid ? "text-[#191919] hover:text-[#B4933A]" : "text-white hover:text-[#ffe7a3]"
  }`}
/>

                </button>
              ) : (
                <div ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setShowAccountMenu((prev) => !prev)}
                    className={`flex items-center space-x-1 transition-all duration-300 ${
  showSolid ? "text-[#191919] hover:text-[#B4933A]" : "text-white hover:text-[#ffe7a3]"
}`}

                    aria-label="My Account Menu"
                  >
                    <UserIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    <ChevronDownIcon className="h-4 w-4 mt-px" />
                  </button>

                  {showAccountMenu && (
                    <div
                      className="absolute right-0 top-8 w-44 bg-white/95 backdrop-blur-md border border-[#e7dabf] rounded-xl shadow-[0_8px_18px_rgba(0,0,0,0.15)] py-2 z-9999 animate-fadeIn"
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
  onClick={openCart}
  type="button"
>
 <ShoppingBagIcon
  className={`h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-500 ${
    showSolid ? "text-[#191919] hover:text-[#B4933A]" : "text-white hover:text-[#ffe7a3]"
  } ${animateCart ? "animate-bounce" : ""}`}
/>


  {cartCount > 0 && (
    <span className="absolute -top-2 -right-2 rounded-full bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center font-bold">
      {cartCount}
    </span>
  )}
</button>

              <MiniCart

              />
            </div>
          </div>
        </div>
        <AnimatePresence>
  {mobileMenuOpen && (
    <>
      {/* 🌑 Backdrop */}
      <motion.div
        className="fixed inset-0 z-9980 sm:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* 📜 Slide-down Menu */}
      <motion.div
        className={`absolute left-0 right-0 top-full z-9990 border-b shadow-xl sm:hidden
  ${showSolid ? "bg-[#fcfbf8]" : "bg-[#1b180d]/90 backdrop-blur-lg"}
`}

        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
         drag="y"
        dragDirectionLock
        dragConstraints={{ top: 0, bottom: 300 }}
        dragElastic={0.2}
        onDragEnd={(e, info) => {
          if (info.offset.y > 120) {
            setMobileMenuOpen(false);
          }
        }}
      >
        <div className="px-6 py-6 space-y-5 font-[Outfit]">
  {[
    { name: "Shop", href: "/collection" },
    { name: "Our Story", action: "scroll" },
    { name: "Contact", href: "/contact-us" },
  ].map((item) =>
    item.action === "scroll" ? (
      <button
        key={item.name}
        type="button"
        onClick={handleClick}
        className={`block text-left text-sm uppercase tracking-widest transition
  ${showSolid
    ? "text-[#1b180d] hover:text-[#b28c34]"
    : "text-white hover:text-[#ffe7a3]"
  }`}

      >
        {item.name}
      </button>
    ) : (
      <Link
        key={item.name}
        href={item.href}
        onClick={() => setMobileMenuOpen(false)}
        className={`block text-sm uppercase tracking-widest transition
  ${showSolid
    ? "text-[#1b180d] hover:text-[#b28c34]"
    : "text-white hover:text-[#ffe7a3]"
  }`}

      >
        {item.name}
      </Link>
    )
  )}


          {/* CTA — same as desktop */}
          {/* <Link href="/collection" onClick={() => setMobileMenuOpen(false)}>
            <button
              className="relative group w-full flex items-center justify-center h-9 px-6 rounded-md overflow-hidden text-sm font-semibold tracking-wide uppercase text-[#1b180d] transition-all shadow-[0_3px_8px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_15px_rgba(0,0,0,0.15)] font-[Outfit]"
              style={{
                background:
                  "linear-gradient(45deg, #a66d30, #ffe58e 50%, #e0b057)",
              }}
            >
              <span className="relative z-10">SHOP NOW</span>
              <span className="absolute top-0 left-[-80%] w-[60%] h-full bg-linear-to-tr from-transparent via-white/50 to-transparent rotate-25 opacity-0 group-hover:opacity-100 animate-shine-slow"></span>
            </button>
          </Link> */}
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>


      </nav>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* Shared Shine Animation */}
      <style jsx global>{`
        @keyframes shineSlow {
          0% {
            left: -80%;
            opacity: 0.05;
          }
          25% {
            opacity: 0.3;
          }
          50% {
            left: 120%;
            opacity: 0.25;
          }
          100% {
            left: 120%;
            opacity: 0;
          }
        }
        .animate-shine-slow {
          animation: shineSlow 3.8s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
