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
import { useTheme } from "@/app/theme-provider";
import { Sun, Moon } from "lucide-react";




const AuthModal = dynamic(
  () => import('@/app/auth/modal'),
  { ssr: false, loading: () => null }
);


export default function NavBar() {
  const pathname = usePathname(); // ⭐ ADDED
  if (pathname.startsWith("/admin")) return null;
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

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
  if (typeof window === "undefined") return;

  const handleScroll = () => {
    const y = window.scrollY;

    if (isHome) {
      setPastMarquee(y > MARQUEE_HEIGHT);
      const heroThreshold = window.innerHeight - 80;
      setIsScrolled(y > heroThreshold);
    } else {
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
        ? "bg-white dark:bg-[#0E0E0E] backdrop-blur-[2px] border-b border-gray-200 dark:border-gray-800 shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
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
    showSolid ? "text-gray-900 dark:text-white" : "text-white"
  }`}
/>

              </button>
            </div>

            {/* MOBILE MENU */}
            {/* MOBILE MENU */}
<AnimatePresence>
  {mobileMenuOpen && (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      drag="y"
      dragDirectionLock
      dragConstraints={{ top: 0, bottom: 300 }}
      dragElastic={0.2}
      onDragEnd={(e, info) => {
        if (info.offset.y > 120) setMobileMenuOpen(false);
      }}
      className="absolute top-12 left-0 right-0 bg-white dark:bg-[#0E0E0E] border-b border-gray-200 dark:border-gray-800 sm:hidden"
    >
      <div className="px-6 py-6 space-y-6 font-[Outfit]">

        {/* Main navigation */}
        {[
          { name: "Shop", href: "/collection" },
          { name: "Our Story", action: "scroll" },
          { name: "Contact", href: "/contact-us" },
        ].map((item) =>
          item.action === "scroll" ? (
            <button
              key={item.name}
              type="button"
              onClick={() => {
                handleClick();
                setMobileMenuOpen(false);
              }}
              className="block text-left text-sm uppercase tracking-widest text-gray-900 dark:text-white/90 hover:opacity-60 transition"
            >
              {item.name}
            </button>
          ) : (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm uppercase tracking-widest text-gray-900 dark:text-white/90 hover:opacity-60 transition"
            >
              {item.name}
            </Link>
          )
        )}

        {/* Divider */}
        <div className="h-px bg-gray-200 dark:bg-white/10" />

        {/* Auth actions in mobile */}
        {!session ? (
          <button
            onClick={() => {
              setShowAuthModal(true);
              setMobileMenuOpen(false);
            }}
            className="block text-left text-sm uppercase tracking-widest text-gray-900 dark:text-white/90 hover:opacity-60 transition"
          >
            Login / Register
          </button>
        ) : (
          <>
            <Link
              href="/my-account"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm uppercase tracking-widest text-gray-900 dark:text-white/90 hover:opacity-60 transition"
            >
              My Account
            </Link>

            <button
              onClick={() => {
                signOut();
                setMobileMenuOpen(false);
              }}
              className="block text-left text-sm uppercase tracking-widest text-gray-900 dark:text-white/90 hover:opacity-60 transition"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </motion.div>
  )}
</AnimatePresence>


            {/* CENTER (Logo) */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.15 }}
              className="flex justify-center w-full absolute left-0 right-0 pointer-events-none mt-0.5"
            >
              <Link href="/" className="pointer-events-auto">
                <LogoText
  size="lg"
  className={`transition-colors duration-500 ${
    showSolid
  ? "text-black dark:text-white"
  : "text-white"
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
                    className="relative group flex items-center justify-center min-w-[130px] h-10 px-6 rounded-md overflow-hidden text-sm font-semibold tracking-wide uppercase text-[text-gray-900] transition-all shadow-[0_4px_10px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_15px_rgba(0,0,0,0.15)] font-[Manrope,sans-serif] cursor-pointer"
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
  

              {/* Account / Login */}

              {/* Theme Toggle */}
<button
  onClick={toggleTheme}
  aria-label="Toggle theme"
  className={`transition-transform duration-300 hover:scale-110 ${
    showSolid ? "text-gray-900 dark:text-white/85" : "text-white/90"
  }`}
>
  {theme === "dark" ? (
    <Sun className="h-5 w-5 sm:h-6 sm:w-6 hover:text-gray-400 transition-colors" />
  ) : (
    <Moon className="h-5 w-5 sm:h-6 sm:w-6 hover:text-gray-500 transition-colors" />
  )}
</button>
              <div className="hidden sm:block">
{!session ? (
  <button
    onClick={() => setShowAuthModal(true)}
    aria-label="Login / Register"
    className="bg-transparent border-none outline-none"
  >
    <UserIcon
      className={`h-6 w-6 transition-all duration-300 hover:scale-105 ${
        showSolid
          ? "text-gray-900 dark:text-white/85 hover:text-gray-400"
          : "text-white/90 hover:text-white"
      }`}
    />
  </button>
) : (
  <div ref={dropdownRef} className="relative">
    <button
      onClick={() => setShowAccountMenu((prev) => !prev)}
      aria-label="My Account Menu"
      className={`flex items-center space-x-1 transition-all duration-300 hover:scale-[1.02] ${
        showSolid
          ? "text-gray-900 dark:text-white/85 hover:text-gray-400"
          : "text-white/90 hover:text-white"
      }`}
    >
      <UserIcon className="h-5 w-5 sm:h-6 sm:w-6" />
      <ChevronDownIcon className="h-4 w-4 mt-px opacity-70" />
    </button>

    {showAccountMenu && (
      <div
        className="
          absolute right-0 top-9 w-44 rounded-xl z-9999
          bg-white/95 dark:bg-[#0E0E0E]/95
          backdrop-blur-[2px]
          border border-gray-200 dark:border-white/10
          shadow-[0_12px_40px_rgba(0,0,0,0.35)]
          py-2 animate-fadeIn
        "
        onMouseEnter={() => setShowAccountMenu(true)}
        onMouseLeave={() => setShowAccountMenu(false)}
      >
        <Link
          href="/my-account"
          onClick={() => setShowAccountMenu(false)}
          className="
            block px-4 py-2 text-[14px] font-medium tracking-wide
            text-gray-900 dark:text-white/85
            hover:bg-gray-100 dark:hover:bg-white/5
            transition-colors rounded-md
          "
        >
          My Account
        </Link>

        <button
          onClick={() => {
            setShowAccountMenu(false);
            signOut();
          }}
          className="
            w-full text-left block px-4 py-2 text-[14px] font-medium tracking-wide
            text-gray-900 dark:text-white/85
            hover:bg-gray-100 dark:hover:bg-white/5
            transition-colors rounded-md
          "
        >
          Logout
        </button>
      </div>
    )}
  </div>
)}
</div>
{/* Cart */}
<button
  aria-label="View Cart"
  id="cart-icon"
  type="button"
  onClick={openCart}
  className="relative bg-transparent border-none outline-none"
>
  <ShoppingBagIcon
    className={`h-5 w-5 sm:h-6 sm:w-6 transition-all duration-300 hover:scale-105 ${
      showSolid
        ? "text-gray-900 dark:text-white/85 hover:text-gray-400"
        : "text-white/90 hover:text-white"
    } ${animateCart ? "animate-bounce" : ""}`}
  />

  {cartCount > 0 && (
    <span className="
      absolute -top-2 -right-2 w-5 h-5 rounded-full
      bg-red-600 text-white text-[11px] font-semibold
      flex items-center justify-center
    ">
      {cartCount}
    </span>
  )}
</button>

<MiniCart />



            </div>
          </div>
        </div>
      </nav>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}
