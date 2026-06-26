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
  Star,
  X,
  ExternalLink,
  ChevronLeft,
  Warehouse,
  Receipt,
} from "lucide-react";

export default function AdminSidebar({ closeMobile, collapsed, onToggleCollapse }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const menu = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { name: "Orders", icon: ShoppingCart, href: "/admin/orders" },
    { name: "Products", icon: Boxes, href: "/admin/products" },
    { name: "Inventory", icon: Warehouse, href: "/admin/inventory" },
    { name: "Expenses", icon: Receipt, href: "/admin/expenses" },
    { name: "Customers", icon: Users, href: "/admin/customers" },
    { name: "Reviews", icon: Star, href: "/admin/reviews" },
    { name: "Carts", icon: ShoppingBag, href: "/admin/carts" },
    { name: "Coupons", icon: BadgePercent, href: "/admin/coupons" },
  ];

  const isActive = (href) =>
    href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);

  const userName = session?.user?.name || "Admin";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Logo + Mobile Close */}
      <div className={`flex items-center border-b border-[#e7e1cf] ${collapsed ? "flex-col gap-3 px-2 py-4" : "justify-between px-5 py-4"}`}>
        <div className={`flex items-center ${collapsed ? "" : "gap-3"}`}>
          <Image
            src="/favicon2.png"
            alt="Raven Fragrance"
            width={30}
            height={30}
            className="rounded-full shrink-0"
          />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#1b180d] leading-tight truncate">Raven Fragrance</p>
              <p className="text-[10px] text-[#9a864c]">Admin</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Collapse toggle (desktop) */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={`p-1.5 rounded-lg text-[#6b6654] hover:bg-[#f5f1e6] hover:text-[#b28c34] transition-all duration-200 hidden md:flex ${collapsed ? "mt-1" : ""}`}
            >
              <ChevronLeft size={16} className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
            </button>
          )}

          {/* Close button (mobile) */}
          {closeMobile && (
            <button onClick={closeMobile} className="p-1.5 rounded-lg hover:bg-[#f5f1e6] md:hidden">
              <X size={18} className="text-[#1b180d]" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 py-4 space-y-0.5 overflow-y-auto ${collapsed ? "px-2" : "px-3"}`}>
        {!collapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9a864c] px-3 mb-2">
            Menu
          </p>
        )}

        {menu.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobile}
              title={collapsed ? item.name : undefined}
              className={`
                flex items-center rounded-lg text-[13px] transition-all duration-150
                ${collapsed ? "justify-center h-10 w-10 mx-auto" : "gap-3 h-10 px-3"}
                ${active
                  ? "bg-[#b28c34] text-white font-semibold shadow-sm"
                  : "text-[#4a4637] hover:bg-[#f5f1e6] hover:text-[#1b180d]"
                }
              `}
            >
              <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Visit Store */}
      <div className={`${collapsed ? "px-2" : "px-3"} pb-2`}>
        <a
          href="https://www.ravenfragrance.in"
          target="_blank"
          rel="noopener noreferrer"
          title={collapsed ? "Visit Store" : undefined}
          className={`flex items-center rounded-lg text-[12px] text-[#6b6654] hover:bg-[#f5f1e6] transition ${
            collapsed ? "justify-center h-10 w-10 mx-auto" : "gap-2 px-3 py-2"
          }`}
        >
          <ExternalLink size={14} />
          {!collapsed && <span>Visit Store</span>}
        </a>
      </div>

      {/* User Section */}
      <div className={`border-t border-[#e7e1cf] ${collapsed ? "px-2 py-3 flex justify-center" : "px-4 py-3"}`}>
        <div className={`flex items-center ${collapsed ? "" : "gap-2.5"}`}>
          <div className="w-8 h-8 rounded-full bg-[#b28c34] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#1b180d] truncate">{userName}</p>
              <p className="text-[10px] text-[#9a864c] uppercase">Admin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
