"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Menu, LogOut, Search, X, ShoppingCart, Package, Users } from "lucide-react";

export default function AdminHeader({ onToggleMobile }) {
  const { data: session } = useSession();
  const router = useRouter();
  const userName = session?.user?.name || "Admin";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Close search on outside click
  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Auto-focus input when search opens
  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (data.success) setResults(data.results);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  function handleResultClick(type, id) {
    setSearchOpen(false);
    setQuery("");
    setResults(null);

    if (type === "order") router.push(`/admin/orders/${id}`);
    else if (type === "product") router.push(`/admin/products/${id}/edit`);
    else if (type === "customer") router.push(`/admin/customers/${id}`);
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#e7e1cf] bg-white/95 backdrop-blur-sm px-4 sm:px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-2 rounded-lg hover:bg-[#f5f1e6] transition"
          onClick={onToggleMobile}
        >
          <Menu size={20} className="text-[#1b180d]" />
        </button>
        <h2 className="text-sm sm:text-base font-bold text-[#1b180d]">Admin Panel</h2>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div ref={searchRef} className="relative">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 rounded-lg hover:bg-[#f5f1e6] transition"
          >
            <Search size={18} className="text-[#6b6654]" />
          </button>

          {searchOpen && (
            <div className="absolute right-0 top-11 w-[320px] sm:w-[400px] bg-white border border-[#e7e1cf] rounded-xl shadow-xl z-50">
              {/* Input */}
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#e7e1cf]">
                <Search size={16} className="text-[#9a864c] shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search orders, products, customers..."
                  className="flex-1 text-sm outline-none bg-transparent text-[#1b180d] placeholder:text-[#9a864c]"
                />
                {query && (
                  <button onClick={() => { setQuery(""); setResults(null); }}>
                    <X size={14} className="text-[#6b6654]" />
                  </button>
                )}
              </div>

              {/* Results */}
              <div className="max-h-[320px] overflow-y-auto">
                {searching && (
                  <p className="text-xs text-[#6b6654] p-3">Searching...</p>
                )}

                {!searching && results && (
                  <>
                    {results.orders?.length > 0 && (
                      <ResultSection
                        title="Orders"
                        icon={<ShoppingCart size={12} />}
                        items={results.orders}
                        onSelect={(item) => handleResultClick("order", item._id)}
                        renderItem={(item) => (
                          <>
                            <span className="font-medium">{item.customOrderId || item._id.slice(-6)}</span>
                            <span className="text-[#6b6654]"> — {item.userName}</span>
                          </>
                        )}
                      />
                    )}

                    {results.products?.length > 0 && (
                      <ResultSection
                        title="Products"
                        icon={<Package size={12} />}
                        items={results.products}
                        onSelect={(item) => handleResultClick("product", item._id)}
                        renderItem={(item) => (
                          <span className="font-medium">{item.name}</span>
                        )}
                      />
                    )}

                    {results.customers?.length > 0 && (
                      <ResultSection
                        title="Customers"
                        icon={<Users size={12} />}
                        items={results.customers}
                        onSelect={(item) => handleResultClick("customer", item._id)}
                        renderItem={(item) => (
                          <>
                            <span className="font-medium">{item.name}</span>
                            <span className="text-[#6b6654]"> — {item.phone || item.email}</span>
                          </>
                        )}
                      />
                    )}

                    {!results.orders?.length && !results.products?.length && !results.customers?.length && (
                      <p className="text-xs text-[#6b6654] p-3 text-center">No results found</p>
                    )}
                  </>
                )}

                {!searching && !results && query === "" && (
                  <p className="text-xs text-[#9a864c] p-3 text-center">
                    Type to search orders, products, or customers
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User badge */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#f5f1e6]">
          <div className="w-6 h-6 rounded-full bg-[#b28c34] text-white text-[10px] font-bold flex items-center justify-center">
            {initials}
          </div>
          <span className="text-xs font-medium text-[#1b180d]">{userName}</span>
        </div>

        {/* Logout */}
        <button
          onClick={() => signOut()}
          title="Logout"
          className="p-2 rounded-lg hover:bg-red-50 text-[#6b6654] hover:text-red-600 transition"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}

function ResultSection({ title, icon, items, onSelect, renderItem }) {
  return (
    <div className="border-b border-[#e7e1cf] last:border-b-0">
      <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-1">
        <span className="text-[#b28c34]">{icon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9a864c]">{title}</span>
      </div>
      {items.slice(0, 5).map((item) => (
        <button
          key={item._id}
          onClick={() => onSelect(item)}
          className="w-full text-left px-3 py-2 text-xs hover:bg-[#f5f1e6] transition truncate"
        >
          {renderItem(item)}
        </button>
      ))}
    </div>
  );
}
