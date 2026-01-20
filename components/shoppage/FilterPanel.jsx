'use client';

import { useState, useRef, useMemo } from 'react';
import { Funnel, X } from 'lucide-react';

export default function FilterPanel({
  onFilterChange,
  initialFilters = {},
  isMobile = false,
}) {
  const [isOpen, setIsOpen] = useState(!isMobile);

  const [activeFilters, setActiveFilters] = useState({
    fragranceFamily: initialFilters.fragranceFamily || [],
  });

  const debounceRef = useRef(null);

  const options = useMemo(
    () => ({
      fragranceFamily: [
        { value: 'floral', label: 'Floral' },
        { value: 'woody', label: 'Woody' },
        { value: 'citrus', label: 'Citrus' },
        { value: 'oriental', label: 'Oriental' },
        { value: 'fresh', label: 'Fresh' },
      ],
    }),
    []
  );

  const applyFilters = (filters) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFilterChange?.(filters);
    }, 150);
  };

  const toggle = (value) => {
    const current = activeFilters.fragranceFamily;
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    const next = { fragranceFamily: updated };
    setActiveFilters(next);
    if (!isMobile) applyFilters(next);
  };

  const clearAll = () => {
    const cleared = { fragranceFamily: [] };
    setActiveFilters(cleared);
    onFilterChange?.(cleared);
  };

  const handleApplyMobile = () => {
    onFilterChange?.(activeFilters);
    setIsOpen(false);
  };

  const count = activeFilters.fragranceFamily.length;

  const content = (
  <div className="p-8 space-y-5 bg-white border border-[#e6e6e6] ">

    {/* Header */}
    <div className="flex justify-between items-center pb-6 border-b border-[#ededed]">
      <div className="flex items-center gap-3">
        <Funnel size={16} className="text-[#111]" />
        <span className="text-xs tracking-[0.25em] uppercase text-[#111] font-medium">
          Discover by Intention
        </span>
        {count > 0 && (
          <span className="text-[11px] bg-black text-white px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>

      {count > 0 && (
        <button
          onClick={clearAll}
          className="text-xs text-[#777] hover:text-black underline"
        >
          Clear
        </button>
      )}
    </div>

    {/* Section */}
    <div className="space-y-6">
      <p className="text-sm text-[#666]">Fragrance Family</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {options.fragranceFamily.map((o) => {
          const active = activeFilters.fragranceFamily.includes(o.value);

          return (
            <button
              key={o.value}
              onClick={() => toggle(o.value)}
              className={`
                py-3 px-4 text-xs tracking-[0.2em] uppercase transition-all duration-300
                border rounded-md
                ${
                  active
                    ? "bg-black text-white border-black"
                    : "bg-white text-[#111] border-[#e5e5e5] hover:border-black"
                }
              `}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  </div>
);


  // MOBILE
  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="w-full border border-[#e5e5e5] px-4 py-3 flex justify-between items-center bg-white"
        >
          <span className="text-xs tracking-widest uppercase text-[#111]">
            Filters
          </span>

          {count > 0 && (
            <span className="text-[11px] border border-[#ddd] px-2 py-0.5 rounded-full text-[#555]">
              {count}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="fixed inset-0 z-50 bg-black/20">
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] flex flex-col">
              <div className="flex justify-between items-center px-6 py-4 border-b border-[#eee]">
                <span className="text-xs tracking-widest uppercase text-[#111]">
                  Filters
                </span>
                <button onClick={() => setIsOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">{content}</div>

              <div className="p-4 border-t border-[#eee]">
                <button
                  onClick={handleApplyMobile}
                  className="w-full py-3 border border-[#111] text-[#111] hover:bg-[#f7f7f7] transition"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

 return (
  <div className="w-full">
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="border border-[#e6e6e6]  bg-white">
        {content}
      </div>
    </div>
  </div>
);

}
