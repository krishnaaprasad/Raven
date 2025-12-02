"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, Calendar, ChevronDown, X, ShoppingCart, Users } from "lucide-react";

const PAGE_SIZE = 10;

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState([]);
  const [stats, setStats] = useState({
    totalCarts: 0,
    guestCarts: 0,
    registeredCarts: 0,
  });

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");   // all | guest | registered
  const [dateRange, setDateRange] = useState("all");

  const [typeOpen, setTypeOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  
  const [selectedCart, setSelectedCart] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);


  // 🔁 Load abandoned carts
  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          search,
          type,
          dateRange,
        });

        const res = await fetch(`/api/admin/carts?${params.toString()}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Fetch error");

        setCarts(data.carts || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);

        setStats({
          totalCarts: data.stats?.totalCarts || 0,
          guestCarts: data.stats?.guestCarts || 0,
          registeredCarts: data.stats?.registeredCarts || 0,
        });
      } catch (err) {
        console.error("Failed to load abandoned carts:", err);
      }
    }

    load();
  }, [page, search, type, dateRange]);


  const showingFrom = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, total);

  return (
    <main className="font-[Manrope,sans-serif] text-[#1b180d] min-h-screen space-y-6">
      <h1 className="text-2xl font-bold">Abandoned Carts</h1>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<ShoppingCart size={22} />} label="Total Carts" value={stats.totalCarts} />
        <StatCard icon={<Users size={22} />} label="Guest Carts" value={stats.guestCarts} />
        <StatCard icon={<Users size={22} />} label="Registered Carts" value={stats.registeredCarts} />
      </div>

      {/* SEARCH + FILTER BAR */}
      <div className="flex flex-wrap gap-3 items-center">

        {/* Search */}
        <div className="flex items-center w-full md:flex-1 h-11 rounded-lg border border-[#e7e1cf] bg-white">
          <span className="px-3 text-gray-500">
            <Search size={18} />
          </span>
          <input
            className="flex-1 h-full text-sm outline-none"
            placeholder="Search by user name, session ID or items…"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
          {search && (
            <button className="px-3 text-gray-400" onClick={() => setSearch("")}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Type filter */}
        <DropdownButton
          label={`User Type: ${
            type === "all" ? "All" : type === "guest" ? "Guest" : "Registered"
          }`}
          open={typeOpen}
          onToggle={() => setTypeOpen((o) => !o)}
        >
          <DropdownItem label="All" onClick={() => setType("all")} active={type === "all"} />
          <DropdownItem label="Guest" onClick={() => setType("guest")} active={type === "guest"} />
          <DropdownItem
            label="Registered"
            onClick={() => setType("registered")}
            active={type === "registered"}
          />
        </DropdownButton>

        {/* Date filter */}
        <DropdownButton
          label={
            dateRange === "all"
              ? "Date Range"
              : dateRange === "7"
              ? "Last 7 Days"
              : "Last 30 Days"
          }
          open={dateOpen}
          onToggle={() => setDateOpen((o) => !o)}
        >
          <DropdownItem label="All Time" active={dateRange === "all"} onClick={() => setDateRange("all")} />
          <DropdownItem label="Last 7 Days" active={dateRange === "7"} onClick={() => setDateRange("7")} />
          <DropdownItem label="Last 30 Days" active={dateRange === "30"} onClick={() => setDateRange("30")} />
        </DropdownButton>

      </div>

      {/* TABLE */}
      <div className="rounded-xl border border-[#e7e1cf] overflow-hidden bg-white">
        <table className="min-w-full table-fixed divide-y divide-[#e7e1cf] text-sm">
          <thead className="bg-[#f5f1e6]">
            <tr>
              <th className="py-3 pl-4 text-left font-semibold">User</th>
              <th className="px-3 text-left font-semibold">Items</th>
              <th className="px-3 text-left font-semibold">Total Value</th>
              <th className="px-3 text-left font-semibold">Last Updated</th>
              <th className="py-3 pr-4 text-right font-semibold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e7e1cf] bg-[#fcfbf8]">
            {carts.map((c) => (
              <tr key={c._id}>
                <td className="py-4 pl-4 whitespace-nowrap">
                  <p className="font-medium">
  {c.userId ? c.userId.name : `Guest-${c.sessionId.slice(0, 6).toUpperCase()}`}
</p>
<p className="text-xs text-gray-500">
  {c.userId ? c.userId.email : "Guest User"}
</p>
                </td>

                <td className="px-3">
                  {c.items?.reduce((sum, i) => sum + i.quantity, 0)} items
                </td>
                <td className="px-3 font-semibold">
                  ₹
                  {c.items
                    ?.reduce((s, x) => s + x.price * x.quantity, 0)
                    .toLocaleString("en-IN")}
                </td>
                <td className="px-3">
                  {new Date(c.updatedAt).toLocaleDateString()}{" "}
                  {new Date(c.updatedAt).toLocaleTimeString()}
                </td>

                <td className="pr-4 text-right">
                  <button
                    onClick={() => {
                      setSelectedCart(c);
                      setDrawerOpen(true);
                    }}
                    className="border border-[#e7e1cf] px-3 py-1.5 rounded-lg text-xs hover:bg-[#f5f1e6]"
                  >
                    View Cart
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>


        {/* Pagination */}
        <div className="flex justify-between items-center px-4 py-3 text-sm">
          <p>
            Showing <b>{showingFrom}</b> to <b>{showingTo}</b> of <b>{total}</b> results
          </p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 border border-[#e7e1cf] rounded-md disabled:opacity-40">
              Previous
            </button>
            <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 border border-[#e7e1cf] rounded-md disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      </div>
    </main>
  );

  {drawerOpen && (
  <CartDrawer
    cart={selectedCart}
    onClose={() => setDrawerOpen(false)}
  />
)}
}


/* SUB COMPONENTS */
function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-xl p-5 border border-[#e7e1cf] bg-[#fcfbf8] flex items-center gap-3">
      {icon}
      <div className="flex flex-col gap-1">
        <p className="text-xs text-gray-600">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function DropdownButton({ label, children, open, onToggle }) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 h-11 px-4 rounded-lg border border-[#e7e1cf] bg-white text-sm"
      >
        <Filter size={16} />
        <span>{label}</span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="absolute mt-2 w-44 rounded-lg border border-[#e7e1cf] bg-white shadow-lg z-20">
          {children}
        </div>
      )}
    </div>
  );
}

function DropdownItem({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 text-xs rounded-md hover:bg-[#f4efe0] ${
        active ? "font-semibold bg-[#f4efe0]" : ""
      }`}
    >
      {label}
    </button>
  );
}

function CartDrawer({ cart, onClose }) {
  const total =
    cart?.items?.reduce((sum, i) => sum + i.price * i.quantity, 0) || 0;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-screen w-[92vw] sm:w-[420px] bg-white z-[9999] shadow-2xl border-l border-[#e7e1cf] flex flex-col"
      >
        <div className="px-5 py-4 border-b flex justify-between items-center bg-[#fcfbf8]">
          <h3 className="text-lg font-semibold">Shopping Cart Details</h3>
          <button onClick={onClose} className="text-3xl leading-none">&times;</button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto">
          <p className="text-sm font-medium mb-1">
            User:
            <span className="font-semibold ml-1">
              {cart?.userId
                ? cart?.user?.name
                : `Guest-${cart?.sessionId?.slice(0, 6).toUpperCase()}`}
            </span>
          </p>

          <p className="text-xs text-gray-500 mb-4">
            Last Updated: {new Date(cart.updatedAt).toLocaleString()}
          </p>

          <div className="space-y-4">
            {cart?.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-lg bg-cover bg-center border"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                <div className="flex-grow">
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-xs text-[#9a864c]">Qty: {item.quantity}</p>
                  <p className="text-xs text-[#9a864c]">Size: {item.size}</p>
                </div>
                <p className="font-semibold text-sm">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer total & buttons */}
        <div className="border-t p-5 space-y-4 bg-[#fcfbf8]">
          <div className="flex justify-between text-base font-bold">
            <span>Total:</span>
            <span>₹{total.toLocaleString("en-IN")}</span>
          </div>

          <button className="w-full py-3 rounded-lg bg-[#b28c34] text-white font-semibold">
            Convert to Order
          </button>

          <button className="w-full py-3 rounded-lg border border-[#e7e1cf] text-sm">
            Delete Cart
          </button>
        </div>
      </div>
    </>
  );
}
