"use client";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { ThemeProvider } from "next-themes";
import { useState } from "react";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-[#111] text-gray-900 dark:text-gray-100 transition-colors duration-300">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Area */}
        <div className="flex-1 flex flex-col">
          <Topbar setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}
