'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '../app/context/cartcontext';
import MiniCart from './MiniCart';
import dynamic from 'next/dynamic';
import { useSession, signOut } from 'next-auth/react';
import {
  ShoppingBagIcon,
  UserIcon,
  ChevronDownIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import LogoText from '@/components/LogoText';
import { useTheme } from "@/app/theme-provider";
import { Sun, Moon } from "lucide-react";

const AuthModal = dynamic(() => import('@/app/auth/modal'), {
  ssr: false,
  loading: () => null,
});

export default function NavBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { cartCount, openCart } = useCart();
  const { data: session } = useSession();

  const dropdownRef = useRef(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [animateCart, setAnimateCart] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [pastMarquee, setPastMarquee] = useState(false);

  const isHome = pathname === "/";
  const MARQUEE_HEIGHT = 40;
  const showSolid = !isHome || isScrolled;

  const handleClick = () => {
    if (window.location.pathname !== "/") {
      router.push("/#why-choose-raven");
    } else {
      document.getElementById("why-choose-raven")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (cartCount > 0) {
      setAnimateCart(true);
      const t = setTimeout(() => setAnimateCart(false), 600);
      return () => clearTimeout(t);
    }
  }, [cartCount]);

  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
  setMobileMenuOpen(false)
}, [pathname])

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const y = window.scrollY;
      if (isHome) {
        setPastMarquee(y > MARQUEE_HEIGHT);
        setIsScrolled(y > window.innerHeight - 80);
      } else {
        setPastMarquee(true);
        setIsScrolled(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

const logoColor = (() => {
  // Transparent navbar (hero area)
  if (!showSolid) return "white";

  // Solid navbar
  return theme === "dark" ? "white" : "black";
})();


  return (
    <>
      <nav
        className={`
          fixed left-0 right-0 z-1000 transition-all duration-500
          ${isHome && !pastMarquee ? "top-10" : "top-0"}
          ${showSolid
            ? "bg-[var(--theme-bg)] border-b border-[var(--theme-border)] backdrop-blur-md"
            : "bg-transparent"}
        `}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative flex h-12 items-center justify-between">

            {/* Mobile hamburger */}
            <div className="sm:hidden">
              <button onClick={() => setMobileMenuOpen(p => !p)}>
                <Bars3Icon
                  className={`h-6 w-6 ${
                    showSolid
                      ? "text-[var(--theme-text)]"
                      : "text-white"
                  }`}
                />
              </button>
            </div>

            {/* Logo */}
            <div className="absolute left-0 right-0 flex justify-center pointer-events-none">
              <Link href="/" className="pointer-events-auto">
                <LogoText
                  size="lg"
                  color={logoColor}
                  className="transition-colors duration-300"
                />
              </Link>
            </div>

            {/* Right icons */}
            <div className="ml-auto flex items-center gap-4">

              {/* Theme */}
              <button onClick={toggleTheme}>
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-[var(--theme-text)]" />
                ) : (
                  <Moon className="h-5 w-5 text-[var(--theme-text)]" />
                )}
              </button>

              {/* Desktop user only */}
              <div className="hidden sm:block">
                {!session ? (
                  <button onClick={() => setShowAuthModal(true)}>
                    <UserIcon className="h-6 w-6 text-[var(--theme-text)]" />
                  </button>
                ) : (
                  <div ref={dropdownRef} className="relative">
                    <button
                      onClick={() => setShowAccountMenu(p => !p)}
                      className="flex items-center gap-1 text-[var(--theme-text)]"
                    >
                      <UserIcon className="h-5 w-5" />
                      <ChevronDownIcon className="h-4 w-4" />
                    </button>

                    {showAccountMenu && (
  <div className="
    absolute right-0 top-9 w-48
    bg-[var(--theme-bg)]
    border border-[var(--theme-border)]
    backdrop-blur-md
    rounded-lg
    shadow-lg
    z-[9999]
  ">
    <Link
      href="/my-account"
      className="block px-4 py-2 text-sm hover:bg-[var(--theme-soft)]"
      onClick={() => setShowAccountMenu(false)}
    >
      My Account
    </Link>
    <button
      onClick={() => {
        signOut()
        setShowAccountMenu(false)
      }}
      className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--theme-soft)]"
    >
      Logout
    </button>
  </div>
)}

                  </div>
                )}
              </div>

              {/* Cart */}
              <button onClick={openCart} className="relative">
                <ShoppingBagIcon
                  className={`h-5 w-5 text-[var(--theme-text)] ${
                    animateCart ? "animate-bounce" : ""
                  }`}
                />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[11px] w-5 h-5 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>

              <MiniCart />
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
  {mobileMenuOpen && (

      <>
      <motion.div
        className="fixed inset-0 bg-black/20 z-[998]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setMobileMenuOpen(false)}
      />

    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="
   fixed top-[3rem] left-0 right-0
   z-[9999]
   bg-[var(--theme-bg)]
   border-b border-[var(--theme-border)]
  backdrop-blur-md
  sm:hidden"
    >
      <div className="px-6 py-6 space-y-6 font-[Outfit]">

        <Link
          href="/collection"
          onClick={() => setMobileMenuOpen(false)}
          className="block text-sm uppercase tracking-widest text-[var(--theme-text)] hover:opacity-60"
        >
          Shop
        </Link>

        <button
          onClick={() => {
            handleClick()
            setMobileMenuOpen(false)
          }}
          className="block text-left text-sm uppercase tracking-widest text-[var(--theme-text)] hover:opacity-60"
        >
          Our Story
        </button>

        <Link
          href="/contact-us"
          onClick={() => setMobileMenuOpen(false)}
          className="block text-sm uppercase tracking-widest text-[var(--theme-text)] hover:opacity-60"
        >
          Contact
        </Link>

        <div className="h-px bg-[var(--theme-border)]" />

        {!session ? (
          <button
            onClick={() => {
              setShowAuthModal(true)
              setMobileMenuOpen(false)
            }}
            className="block text-left text-sm uppercase tracking-widest text-[var(--theme-text)] hover:opacity-60"
          >
            Login / Register
          </button>
        ) : (
          <>
            <Link
              href="/my-account"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm uppercase tracking-widest text-[var(--theme-text)] hover:opacity-60"
            >
              My Account
            </Link>

            <button
              onClick={() => {
                signOut()
                setMobileMenuOpen(false)
              }}
              className="block text-left text-sm uppercase tracking-widest text-[var(--theme-text)] hover:opacity-60"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </motion.div>
      </>
  )}
</AnimatePresence>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}
