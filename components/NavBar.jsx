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
import { X } from "lucide-react";

const AuthModal = dynamic(() => import('@/app/auth/modal'), {
  ssr: false,
  loading: () => null,
});

export default function NavBar() {
  const pathname = usePathname();

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
  const [isDesktop, setIsDesktop] = useState(false);

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setIsDesktop(window.innerWidth >= 640);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

const logoColor = theme === "dark" ? "white" : "black";
const iconColorClass =
  theme === "dark" ? "text-white" : "text-black";


const sidebarTop = pastMarquee
  ? "3rem"            // marquee gone → only navbar
  : "calc(40px + 3rem)"; // marquee + navbar

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <nav
        className={`
          fixed left-0 right-0 z-1000 transition-all duration-500
          ${isHome && !pastMarquee ? "top-10" : "top-0"}
          ${showSolid
            ? "bg-(--theme-bg) border-b border-(--theme-border) backdrop-blur-md"
            : "bg-transparent"}
        `}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative flex h-12 items-center justify-between">

            {/* Mobile hamburger */}
            {/* Hamburger (mobile + desktop) */}
            <div>
              <button
  onClick={() => setMobileMenuOpen(p => !p)}
  className="relative w-8 h-8 flex items-center justify-center"
  aria-label="Toggle menu"
>
  <AnimatePresence mode="wait" initial={false}>
    {!mobileMenuOpen ? (
      <motion.span
        key="menu"
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={iconColorClass}

      >
        <Bars3Icon className="h-6 w-6" />
      </motion.span>
    ) : (
      <motion.span
        key="close"
        initial={{ rotate: 90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: -90, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="text-(--theme-text)"
      >
        <X className="h-6 w-6" />
      </motion.span>
    )}
  </AnimatePresence>
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
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                aria-pressed={theme === 'dark'}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-(--theme-text)" />
                ) : (
                  <Moon className="h-5 w-5 text-(--theme-text)" />
                )}
              </button>

              {/* Desktop user only */}
              <div className="hidden sm:block">
                {!session ? (
                  <button onClick={() => setShowAuthModal(true)}>
                    <UserIcon className="h-6 w-6 text-(--theme-text)" />
                  </button>
                ) : (
                  <div ref={dropdownRef} className="relative">
                    <button
                      onClick={() => setShowAccountMenu(p => !p)}
                      className="flex items-center gap-1 text-(--theme-text)"
                    >
                      <UserIcon className="h-5 w-5" />
                      <ChevronDownIcon className="h-4 w-4" />
                    </button>

                    {showAccountMenu && (
  <div className="
    absolute right-0 top-9 w-48
    bg-(--theme-bg)
    border border-(--theme-border)
    backdrop-blur-md
    rounded-lg
    shadow-lg
    z-9999
  ">
    <Link
      href="/my-account"
      className="block px-4 py-2 text-sm hover:bg-(--theme-soft)"
      onClick={() => setShowAccountMenu(false)}
    >
      My Account
    </Link>
    <button
      onClick={() => {
        signOut()
        setShowAccountMenu(false)
      }}
      className="block w-full text-left px-4 py-2 text-sm hover:bg-(--theme-soft)"
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
                  className={`h-5 w-5 text-(--theme-text) ${
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

  initial={{
    x: isDesktop ? -320 : 0,
    y: !isDesktop ? -20 : 0,
    opacity: 0,
  }}
  animate={{ x: 0, y: 0, opacity: 1 }}
  exit={{
    x: isDesktop ? -320 : 0,
    y: !isDesktop ? -20 : 0,
    opacity: 0,
  }}
  transition={{ duration: 0.3, ease: "easeOut" }}
  className="
    fixed z-9999
    bg-(--theme-bg)
    border-r border-(--theme-border)
    backdrop-blur-md

    /* DESKTOP */
    sm:left-0 sm:h-[calc(100vh-var(--sidebar-top))] sm:w-[320px]

    /* MOBILE */
    left-0 right-0
    border-b sm:border-b-0
  "
  style={{
  top: sidebarTop,
  "--sidebar-top": sidebarTop,
}}

>


      <div className="px-8 pt-16 pb-10 space-y-7 font-[Outfit]">

        <Link
          href="/collection"
          onClick={() => setMobileMenuOpen(false)}
          className="block text-sm uppercase tracking-widest text-(--theme-text) hover:opacity-60"
        >
          Shop
        </Link>

        <Link
          href="/philosophy"
          onClick={() => setMobileMenuOpen(false)}
          className="block text-sm uppercase tracking-widest text-(--theme-text) hover:opacity-60"
        >
          Philosophy
        </Link>

        <Link
          href="/contact-us"
          onClick={() => setMobileMenuOpen(false)}
          className="block text-sm uppercase tracking-widest text-(--theme-text) hover:opacity-60"
        >
          Contact
        </Link>

        <div className="h-px bg-(--theme-border)" />

        {!session ? (
          <button
            onClick={() => {
              setShowAuthModal(true)
              setMobileMenuOpen(false)
            }}
            className="block text-left text-sm uppercase tracking-widest text-(--theme-text) hover:opacity-60"
          >
            Login / Register
          </button>
        ) : (
          <>
            <Link
              href="/my-account"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm uppercase tracking-widest text-(--theme-text) hover:opacity-60"
            >
              My Account
            </Link>

            <button
              onClick={() => {
                signOut()
                setMobileMenuOpen(false)
              }}
              className="block text-left text-sm uppercase tracking-widest text-(--theme-text) hover:opacity-60"
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

