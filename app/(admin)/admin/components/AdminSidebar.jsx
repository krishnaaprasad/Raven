"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Users,
  BadgePercent,
  ShoppingBag,
  BarChart3,
  Star,
  X,
  Flower,
} from "lucide-react";

export default function AdminSidebar({ closeMobile }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const menu = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/admin" },
    { name: "Orders", icon: <ShoppingCart size={20} />, href: "/admin/orders" },
    { name: "Products", icon: <Boxes size={20} />, href: "/admin/products" },
    { name: "Customers", icon: <Users size={20} />, href: "/admin/customers" },
    { name: "Reviews", icon: <Star size={20} />, href: "/admin/reviews" },
    { name: "Carts", icon: <ShoppingBag size={20} />, href: "/admin/carts" },
    { name: "Coupons", icon: <BadgePercent size={20} />, href: "/admin/coupons" },
  ];

  const isActive = (href) =>
    href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);

  const avatar =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAiEvFRw0W1r2tGqrilugxDup0fex1t4xQE6riRQrAIQHDA5Jkbjv-SehJFLdN1ppqEbBoGKHxS9dmoylH3I_ljoIVk-lZVbp9xJ9piYDhnwghKHa4madgUzQnI4Q7VmZ1fG30OqcgEZBYL_ghb0SipKjtjoNtET13WBXAeTaqZW630f5hITguW1XZxjHIuDvZMz_C09gS96zpdfbkaFJ4mOjWaqRzZrKdDHL1Fy9hgip4n37jTsdi0_f2kY3jtkblFg7E2VVrKOJ4";

  return (
    <div className="flex flex-col h-full bg-[#fcfbf8]">

      {/* Mobile Close Button */}
      <div className="flex md:hidden justify-end p-4">
        <button onClick={closeMobile}>
          <X size={24} className="text-[#1b180d]" />
        </button>
      </div>
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="rounded-full bg-[#9a864c] p-0 text-white">
          <Image
            src="/favicon2.png"
            alt="logo"
            width={40}
            height={40}
          />
        </div>
        <p className="text-lg font-semibold">Raven Fragrance</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4">
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={closeMobile}
            className={`flex items-center gap-4 h-12 px-4 rounded-lg mb-1 transition ${
              isActive(item.href)
                ? "bg-[#f3efe6] text-[#9a864c] font-semibold"
                : "hover:bg-black/5"
            }`}
          >
            <span
              className={
                isActive(item.href) ? "text-[#9a864c]" : "text-[#8a846e]"
              }
            >
              {item.icon}
            </span>

            <span className="text-sm">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-[#e7e1cf] flex items-center gap-3">
        <img
          src={avatar}
          className="h-10 w-10 rounded-full object-cover"
          alt="avatar"
        />

        <div>
          <p className="font-medium">{session?.user?.name || "Loading..."}</p>
          <p className="text-xs text-[#9a864c]">{session?.user?.role || "Admin"}</p>
        </div>
      </div>
    </div>
  );
}
