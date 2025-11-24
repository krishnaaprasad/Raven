"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const linkClass = (path) =>
    `block px-4 py-2 rounded-lg mb-2 font-medium ${
      pathname === path
        ? "bg-[#9a864c] text-white"
        : "hover:bg-[#d6c9a8] text-[#1b180d]"
    }`;

  return (
    <div>
      <h2 className="text-2xl font-serif mb-6">Raven Admin</h2>

      <Link href="/admin" className={linkClass("/admin")}>
        Dashboard
      </Link>

      <Link href="/admin/orders" className={linkClass("/admin/orders")}>
        Orders
      </Link>

      <Link href="/admin/products" className={linkClass("/admin/products")}>
        Products
      </Link>

      <Link href="/admin/users" className={linkClass("/admin/users")}>
        Users
      </Link>

      <Link href="/admin/settings/marquee" className={linkClass("/admin/settings/marquee")}>
        Marquee Text
      </Link>
    </div>
  );
}
