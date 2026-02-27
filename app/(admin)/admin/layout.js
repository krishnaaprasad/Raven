"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";

    const root = document.documentElement;
    root.classList.remove("dark");

    return () => {
      // when leaving admin, restore dark if saved
      const saved = localStorage.getItem("theme");
      if (saved === "dark") {
        root.classList.add("dark");
      }
    };
  }, [mobileOpen]);

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