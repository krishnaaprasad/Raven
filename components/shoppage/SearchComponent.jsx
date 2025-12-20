'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

export default function SearchComponent({
  placeholder = "Search Raven perfumes, brands, notes...",
  className = "",
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const ref = useRef(null);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  // 🔍 Fetch with debounce + abort
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setResults(data.results || []);
        setOpen(true);
      } catch (e) {
        if (e.name !== 'AbortError') console.error(e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // close on outside click
  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const goTo = (slug) => {
    setOpen(false);
    router.push(`/product/${slug}`);
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          placeholder={placeholder}
          className="w-full h-12 pl-12 pr-4 bg-[#fcfbf8] border border-[#e7e1cf] rounded-md text-sm font-[Outfit] text-[#1b180d] placeholder:text-[#6b6453] focus:outline-none focus:ring-2 focus:ring-[#b28c34]"
        />
        <Icon
          name={loading ? "ArrowPathIcon" : "MagnifyingGlassIcon"}
          size={18}
          className={`absolute left-4 top-1/2 -translate-y-1/2 text-[#6b6453] ${loading ? 'animate-spin' : ''}`}
        />
      </div>

      {/* Results */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#fcfbf8] border border-[#e7e1cf] rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            results.map((p) => (
              <button
                key={p._id}
                onClick={() => goTo(p.slug)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#f3efe3] transition"
              >
                <img
                  src={p?.images?.[0]?.original || '/placeholder.png'}
                  alt={p.name}
                  className="w-10 h-10 rounded object-cover border border-[#e7e1cf]"
                />
                <div>
                  <p className="text-sm font-[Outfit] text-[#1b180d]">{p.name}</p>
                  <p className="text-xs text-[#6b6453]">{p.brand}</p>
                </div>
              </button>
            ))
          ) : (
            !loading && (
              <div className="px-4 py-6 text-sm text-center text-[#6b6453] font-[Outfit]">
                No results found
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
