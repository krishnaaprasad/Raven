"use client";

import { FaWhatsapp } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { useTheme } from "@/app/theme-provider"; // ✅ adjust path if needed

export default function WhatsAppButton() {
  const pathname = usePathname();
  const { theme } = useTheme(); // light | dark

  if (pathname.startsWith("/admin")) return null;

  const phoneNumber = "918424832375";
  const message = "Hi, I’m interested in Raven Fragrance.";
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  const isLight = theme === "light";

  return (
    <a
      href={whatsappURL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 group"
    >
      <div
        className={`
          relative flex items-center justify-center
          w-14 h-14 sm:w-16 sm:h-16
          rounded-full
          shadow-lg
          transition-all duration-300
          group-hover:scale-105
          ${isLight ? "bg-black text-white" : "bg-white text-black"}
        `}
      >
        <FaWhatsapp
          size={30}
          className="transition-transform duration-300 group-hover:scale-110"
        />
      </div>
    </a>
  );
}
