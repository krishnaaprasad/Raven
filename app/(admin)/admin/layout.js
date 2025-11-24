"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
  }, [mobileOpen]);

  return (
    <div className="min-h-screen flex bg-[#fcfbf8] text-[#1b180d] font-[Manrope,sans-serif]">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r border-[#e7e1cf] bg-[#fcfbf8]">
        <AdminSidebar />
      </aside>

      {/* Mobile Slide-in Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#fcfbf8] border-r border-[#e7e1cf] transform transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar closeMobile={() => setMobileOpen(false)} />
      </aside>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col">

        {/* Header (passes toggle button) */}
        <AdminHeader onToggleMobile={() => setMobileOpen(!mobileOpen)} />

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
