"use client";

import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    alert(`Subscribed successfully with: ${email}`);
    setEmail("");
  };

  return (
    <footer className="bg-black text-neutral-300 border-t border-[#2D2D2D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-center sm:text-left">
          {/* Brand & Social */}
          <div>
            <Image
              src="/whitelogo.PNG"
              alt="Raven Fragrance Logo"
              width={120}
              height={30}
              className="h-8 w-auto mx-auto sm:mx-0 mb-5"
              priority
              draggable={false}
            />
            <p className="text-sm mt-2 text-neutral-400 leading-relaxed">
              Discover your next favorite scent with our curated collection of
              timeless fragrances.
            </p>

            {/* Social Icons */}
            <div className="flex justify-center sm:justify-start space-x-4 mt-5">
              <a
                href="https://www.facebook.com/Ravenfragrance"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <FaFacebookF className="h-5 w-5 text-neutral-400 hover:text-[#B4933A] transition" />
              </a>
              <a
                href="https://www.instagram.com/ravenfragrance.in/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <FaInstagram className="h-5 w-5 text-neutral-400 hover:text-[#B4933A] transition" />
              </a>
              <a
                href="https://chat.whatsapp.com/YourCommunityLinkHere"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join our WhatsApp Community"
              >
                <FaWhatsapp className="h-5 w-5 text-neutral-400 hover:text-[#B4933A] transition" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                { label: "Home", href: "/" },
                { label: "Shop", href: "/product" },
                { label: "About Us", href: "/WhyChooseRaven" },
                { label: "Contact Us", href: "/contact-us" },
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    href={item.href}
                    className="relative text-neutral-400 transition-colors hover:text-[#B4933A] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 hover:after:w-full after:bg-[#B4933A] after:transition-all after:duration-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Company
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                { label: "Privacy Policy", href: "/policy/privacy-policy" },
                { label: "Terms & Conditions", href: "/policy/terms-conditions" },
                { label: "Refund & Cancellation", href: "/policy/refund-cancellation" },
                { label: "Shipping & Delivery", href: "/policy/shipping-delivery" },
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    href={item.href}
                    className="relative text-neutral-400 transition-colors hover:text-[#B4933A] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 hover:after:w-full after:bg-[#B4933A] after:transition-all after:duration-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Newsletter
            </h3>
            <p className="mt-4 text-sm text-neutral-400">
              Subscribe to receive updates on new fragrances and offers.
            </p>
            <form
              onSubmit={handleSubscribe}
              className="mt-4 flex flex-col sm:flex-row items-center sm:items-stretch gap-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full px-4 py-2 bg-transparent border border-neutral-700 rounded-lg text-sm placeholder-neutral-500 focus:outline-none focus:border-[#B4933A] transition"
                required
              />
              <button
                type="submit"
                className="px-6 py-2 bg-[#B4933A] text-black font-semibold rounded-lg text-sm hover:bg-[#cfae56] transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-[#2D2D2D] pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-neutral-500 gap-4">
          <p>© 2025 Raven Fragrance. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-1">
          </div>
        </div>
      </div>
    </footer>
  );
}
