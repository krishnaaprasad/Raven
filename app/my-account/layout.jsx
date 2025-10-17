'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { name: "Dashboard", href: "/my-account" },
  { name: "Orders", href: "/my-account/orders" },
  { name: "Addresses", href: "/my-account/address" },
  { name: "Account Details", href: "/my-account/account-details" },
];

export default function AccountLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex max-w-6xl mx-auto min-h-[65vh] mt-12 rounded-xl bg-[#f9f6f3] shadow-lg w-full">
      <aside className="w-60 px-7 py-11 bg-gradient-to-b from-[#fff8e7] to-[#e8d3b3] border-r border-stone-200">
        <ul>
          {menu.map((item) => (
            <li key={item.href} className="mb-2">
              <Link
                href={item.href}
                className={`block text-lg py-2 px-2 rounded-xl font-medium hover:bg-[#faefd7] hover:text-[#f9be40]
                  ${pathname === item.href ? "bg-[#faefd7] text-[#f9be40]" : "text-stone-700"}`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
        <form action="/api/auth/signout" method="post" className="mt-12">
          <button
            className="w-full py-2 rounded-xl text-left hover:bg-[#fff0ce] text-[#ad563c] font-semibold transition"
          >
            Logout
          </button>
        </form>
      </aside>
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}
