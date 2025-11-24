"use client";

import { useSession, signOut } from "next-auth/react";
import { Bell, Settings, Menu, Search } from "lucide-react";

export default function AdminHeader({ onToggleMobile }) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#e7e1cf] bg-[#fcfbf8]/90 backdrop-blur-md px-6">
      
      {/* Left section */}
      <div className="flex items-center gap-4">

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-black/5 transition"
          onClick={onToggleMobile}
        >
          <Menu size={24} className="text-[#1b180d]" />
        </button>

        <h2 className="text-lg sm:text-2xl font-arial font-bold">Admin Panel</h2>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-6">

        {/* Search bar (hidden on mobile) */}
        <div className="hidden md:flex items-center border border-[#e7e1cf] rounded-lg px-3 h-10 bg-white w-72">
          <Search size={18} className="text-[#9a864c]" />
          <input
            placeholder="Search for orders or products"
            className="ml-2 w-full outline-none text-sm bg-transparent"
          />
        </div>

        {/* Settings */}
        <button className="p-2 rounded-full hover:bg-black/5">
          <Settings size={22} />
        </button>

        {/* Username & Logout (Desktop Only) */}
        <div className="hidden sm:flex items-center gap-3 border-l border-[#e7e1cf] pl-4">

          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-[#b28c34] text-white rounded-lg hover:bg-[#9a864c]"
          >
            Logout
          </button>
        </div>

        {/* Mobile Logout */}
        <button
          onClick={() => signOut()}
          className="sm:hidden px-3 py-1 bg-[#b28c34] text-white rounded-md"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
