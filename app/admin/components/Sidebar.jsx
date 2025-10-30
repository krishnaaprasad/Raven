import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Users, ClipboardList, Settings } from "lucide-react";

const menu = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ClipboardList },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function Sidebar({ sidebarOpen }) {
  const pathname = usePathname();

  return (
    <aside
      className={`${
        sidebarOpen ? "w-64" : "w-20"
      } h-screen border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] shadow-sm transition-all duration-300 flex flex-col`}
    >
      <div className="flex items-center justify-center py-5 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl font-bold text-black dark:text-white">
          {sidebarOpen ? "Raven Admin" : "🕊️"}
        </h1>
      </div>

      <nav className="flex-1 px-2 mt-4 space-y-2">
        {menu.map(({ name, href, icon: Icon }) => (
          <Link
            key={name}
            href={href}
            className={`flex items-center gap-3 p-2 rounded-lg text-sm font-medium ${
              pathname === href
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "hover:bg-gray-100 dark:hover:bg-[#222]"
            } transition-all duration-200`}
          >
            <Icon size={18} />
            {sidebarOpen && <span>{name}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
