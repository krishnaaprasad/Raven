"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Light theme for the admin is applied by app/theme-provider.jsx (it ran after this
  // effect and re-applied dark mode, which made admin text white-on-white)
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
  }, [mobileOpen]);

  if (pathname === "/admin/login") {
    return <div className="font-[Manrope,sans-serif] text-[#1b180d]">{children}</div>;
  }

  return (
    <div
      className="min-h-screen flex font-[Manrope,sans-serif]"
      style={{
        backgroundColor: "#fcfbf8",
        color: "#1b180d",
        colorScheme: "light",
        marginTop: "-48px",
        "--theme-bg": "#fcfbf8",
        "--theme-soft": "#f6f6f6",
        "--theme-border": "#e7e1cf",
        "--theme-text": "#1b180d",
        "--theme-muted": "#6b6654",
      }}
    >
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block shrink-0 border-r border-[#e7e1cf] bg-white h-screen sticky top-0 transition-all duration-300 ${
          collapsed ? "w-[68px]" : "w-60"
        }`}
      >
        <AdminSidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-[#e7e1cf] transform transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar closeMobile={() => setMobileOpen(false)} />
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 min-h-screen flex flex-col overflow-hidden">
        <AdminHeader onToggleMobile={() => setMobileOpen(!mobileOpen)} />

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
