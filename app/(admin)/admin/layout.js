"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";

    const root = document.documentElement;
    root.classList.remove("dark");

    // Force light theme CSS variables on root so portalled modals
    // (rendered via createPortal to document.body) also get correct colors
    root.style.setProperty("--theme-bg", "#fcfbf8");
    root.style.setProperty("--theme-soft", "#f6f6f6");
    root.style.setProperty("--theme-border", "#e7e1cf");
    root.style.setProperty("--theme-text", "#1b180d");
    root.style.setProperty("--theme-muted", "#6b6654");
    root.style.setProperty("--background", "#ffffff");
    root.style.setProperty("--foreground", "#171717");

    return () => {
      // when leaving admin, restore dark if saved
      const saved = localStorage.getItem("theme");
      if (saved === "dark") {
        root.classList.add("dark");
        root.style.setProperty("--theme-bg", "#0f0f0f");
        root.style.setProperty("--theme-soft", "#161616");
        root.style.setProperty("--theme-border", "#262626");
        root.style.setProperty("--theme-text", "#f5f5f5");
        root.style.setProperty("--theme-muted", "#9a9a9a");
        root.style.setProperty("--background", "#0f0f0f");
        root.style.setProperty("--foreground", "#f5f5f5");
      }
    };
  }, [mobileOpen]);

  // Strip sidebar if user is just on the login screen
  if (pathname === "/admin/login") {
    return <div className="font-[Manrope,sans-serif]">{children}</div>;
  }

  return (
    <div
      className="min-h-screen flex font-[Manrope,sans-serif]"
      style={{
        backgroundColor: "#fcfbf8",
        color: "#1b180d",
        "--theme-bg": "#fcfbf8",
        "--theme-soft": "#f6f6f6",
        "--theme-border": "#e7e1cf",
        "--theme-text": "#1b180d",
        "--theme-muted": "#6b6654",
      }}
    >
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 border-r border-[#e7e1cf] bg-[#fcfbf8] h-screen sticky top-0">
        <AdminSidebar />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#fcfbf8] border-r border-[#e7e1cf] transform transition-transform duration-300 md:hidden ${
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