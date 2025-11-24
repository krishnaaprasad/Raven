export const metadata = {
  title: "Admin Dashboard - Raven Fragrance",
  description: "Admin panel for Raven Fragrance",
};

// ❗ This tells Next.js to NOT wrap this layout inside root layout
export const dynamic = "force-dynamic";
export const runtime = "edge";

import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";

export default function AdminLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex bg-[#fcfbf8] text-[#1b180d] font-[Manrope,sans-serif]">
        
        {/* Sidebar */}
        <aside className="w-64 bg-[#e7e1cf] border-r border-[#d6d0bd] p-4 hidden md:block">
          <AdminSidebar />
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col">

          {/* Header */}
          <header className="w-full h-16 border-b border-[#e7e1cf] bg-white px-6 flex items-center justify-between">
            <AdminHeader />
          </header>

          {/* Page content */}
          <div className="p-6">{children}</div>

        </main>
      </body>
    </html>
  );
}
