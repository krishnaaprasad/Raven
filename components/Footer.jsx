"use client";

import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Mail, ShieldCheck, Truck } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    alert(`Subscribed successfully with: ${email}`);
    setEmail("");
  };

  return (
    <footer className="relative bg-[#1b180d] text-[#fcfbf8] overflow-hidden">
      {/* SUBTLE LUXURY GLOW */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#2a2412,transparent_65%)] opacity-60 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-10">
        {/* ================= TOP GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14 mb-20">

          {/* BRAND */}
          <div>
            <Image
              src="/whitelogo.PNG"
              alt="Raven Fragrance Logo"
              width={150}
              height={42}
              className="mb-6"
              priority
            />

            <p className="text-[#fcfbf8]/70 text-sm leading-relaxed mb-6 font-[Manrope,sans-serif] max-w-sm">
              Artisan fragrances crafted to reveal your most authentic self.
              Each scent is a story waiting to be told.
            </p>

            <div className="flex gap-3">
              {[
                { icon: FaFacebookF, href: "https://www.facebook.com/Ravenfragrance" },
                { icon: FaInstagram, href: "https://www.instagram.com/ravenfragrance.in/" },
                { icon: FaWhatsapp, href: "https://chat.whatsapp.com/YourCommunityLinkHere" },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Social link"
                  className="w-10 h-10 rounded-full bg-[#fcfbf8]/10 flex items-center justify-center text-[#fcfbf8]/70 hover:bg-[#b28c34] hover:text-[#1b180d] transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="font-serif text-lg uppercase tracking-widest mb-6">
              Quick Links
            </h3>
            <ul className="space-y-3 font-[Manrope,sans-serif]">
              {[
                { label: "Home", href: "/" },
                { label: "Shop", href: "/product" },
                { label: "About Us", href: "/WhyChooseRaven" },
                { label: "Contact Us", href: "/contact-us" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="group relative text-[#fcfbf8]/70 text-sm hover:text-[#b28c34] transition"
                  >
                    {item.label}
                    <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-[#b28c34] transition-all duration-300 group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <h3 className="font-serif text-lg uppercase tracking-widest mb-6">
              Company
            </h3>
            <ul className="space-y-3 font-[Manrope,sans-serif]">
              {[
                { label: "Privacy Policy", href: "/policy/privacy-policy" },
                { label: "Terms & Conditions", href: "/policy/terms-conditions" },
                { label: "Refund & Cancellation", href: "/policy/refund-cancellation" },
                { label: "Shipping & Delivery", href: "/policy/shipping-delivery" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="group relative text-[#fcfbf8]/70 text-sm hover:text-[#b28c34] transition"
                  >
                    {item.label}
                    <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-[#b28c34] transition-all duration-300 group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div>
            <h3 className="font-serif text-lg uppercase tracking-widest mb-6">
              Stay Connected
            </h3>

            <p className="text-[#fcfbf8]/70 text-sm mb-4 font-[Manrope,sans-serif]">
              Subscribe for exclusive offers, new launches & fragrance stories.
            </p>

            <form onSubmit={handleSubscribe} className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#fcfbf8]/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  aria-label="Email address"
                  className="w-full bg-[#fcfbf8]/10 border border-[#fcfbf8]/20 rounded-lg pl-10 pr-4 py-3 text-sm text-[#fcfbf8] placeholder:text-[#fcfbf8]/50 focus:outline-none focus:border-[#b28c34]"
                  required
                />
              </div>

              <button
                type="submit"
                className="px-6 rounded-lg bg-[#b28c34] text-[#1b180d] font-semibold text-sm hover:bg-[#9a864c] transition"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* ================= BOTTOM BAR ================= */}
        <div className="border-t border-[#fcfbf8]/15 pt-6 mt-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#fcfbf8]/60 text-sm font-[Manrope,sans-serif]">
            © {new Date().getFullYear()} Raven Fragrance. All rights reserved.
          </p>

          <div className="flex items-center gap-5 ">
            {[
              { src: "/upi.svg", alt: "UPI" },
              { src: "/visa.svg", alt: "Visa" },
              { src: "/mastercard.svg", alt: "Mastercard" },
              { src: "/rupay.svg", alt: "RuPay" },
            ].map((p) => (
              <img
                key={p.alt}
                src={p.src}
                alt={p.alt}
                className="h-6 md:h-7 transition duration-300"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </div>

      {/* LUXURY HOVER GLOW */}
      <style jsx>{`
        footer a:hover {
          text-shadow: 0 0 6px rgba(178, 140, 52, 0.35);
        }
      `}</style>
    </footer>
  );
}
