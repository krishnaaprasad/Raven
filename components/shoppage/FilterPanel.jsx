'use client';

import { useState, useRef, useMemo } from 'react';
import Icon from '@/components/ui/AppIcon';

const MIN_PRICE = 0;
const MAX_PRICE = 5000;

export default function FilterPanel({
  onFilterChange,
  initialFilters = {},
  className = '',
  isMobile = false,
}) {
  const [isOpen, setIsOpen] = useState(!isMobile);

  const [activeFilters, setActiveFilters] = useState({
    fragranceFamily: initialFilters.fragranceFamily || [],
    brands: initialFilters.brands || [],
    priceRange: initialFilters.priceRange || [MIN_PRICE, MAX_PRICE],
  });

  const debounceRef = useRef(null);

  const options = useMemo(() => ({
    fragranceFamily: [
      { value: 'floral', label: 'Floral' },
      { value: 'woody', label: 'Woody' },
      { value: 'citrus', label: 'Citrus' },
      { value: 'oriental', label: 'Oriental' },
      { value: 'fresh', label: 'Fresh' },
    ],
    brands: [
      { value: 'raven-signature', label: 'Raven Signature' },
      { value: 'raven-noir', label: 'Raven Noir' },
      { value: 'raven-essence', label: 'Raven Essence' },
      { value: 'raven-luxe', label: 'Raven Luxe' },
    ],
  }), []);

  const update = (filters) => {
    setActiveFilters(filters);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFilterChange?.(filters);
    }, 150);

    if (isMobile) setIsOpen(false);
  };

  const toggle = (key, val) => {
    const arr = activeFilters[key].includes(val)
      ? activeFilters[key].filter((v) => v !== val)
      : [...activeFilters[key], val];

    update({ ...activeFilters, [key]: arr });
  };

  const setPrice = (i, val) => {
    const range = [...activeFilters.priceRange];
    range[i] = Number(val);

    if (range[0] > range[1]) {
      i === 0 ? (range[1] = range[0]) : (range[0] = range[1]);
    }

    update({ ...activeFilters, priceRange: range });
  };

  const clearAll = () => {
    update({
      fragranceFamily: [],
      brands: [],
      priceRange: [MIN_PRICE, MAX_PRICE],
    });
  };

  const count =
    activeFilters.fragranceFamily.length +
    activeFilters.brands.length;

  const Section = ({ title, children }) => {
    const [open, setOpen] = useState(true);

    return (
      <div className="border-b border-[#e7e1cf] last:border-b-0">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="w-full flex justify-between items-center py-4"
        >
          <span className="font-[Outfit] text-sm font-medium text-[#1b180d]">
            {title}
          </span>
          <Icon
            name="ChevronDownIcon"
            size={18}
            className={`text-[#6b6453] transition ${open ? 'rotate-180' : ''}`}
          />
        </button>

        <div
          className={`pb-4 space-y-3 overflow-hidden transition-all duration-300 ease-in-out ${
            open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {children}
        </div>
      </div>
    );
  };

  const content = (
    <div className="p-5">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-[#fcfbf8] z-10 pb-3 mb-4 border-b border-[#e7e1cf]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="FunnelIcon" size={18} className="text-[#1b180d]" />
            <h3 className="font-[Outfit] text-base font-semibold text-[#1b180d]">
              Filters
            </h3>
            {count > 0 ? (
              <span className="bg-[#b28c34] text-white text-xs font-medium px-2 py-0.5 rounded-full">
                {count}
              </span>
            ) : (
              <span className="text-xs text-[#6b6453]">No filters</span>
            )}
          </div>

          {count > 0 && (
            <button
              onClick={clearAll}
              className="text-sm text-[#b28c34] font-medium hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Fragrance */}
      <Section title="Fragrance Family">
        {options.fragranceFamily.map((o) => (
          <label
            key={o.value}
            className="flex items-center gap-3 text-sm cursor-pointer text-[#1b180d] hover:text-[#b28c34] transition"
          >
            <input
              type="checkbox"
              checked={activeFilters.fragranceFamily.includes(o.value)}
              onChange={() => toggle('fragranceFamily', o.value)}
              className="accent-[#b28c34]"
            />
            {o.label}
          </label>
        ))}
      </Section>

      {/* Brands
      <Section title="Brands">
        {options.brands.map((o) => (
          <label
            key={o.value}
            className="flex items-center gap-3 text-sm cursor-pointer text-[#1b180d] hover:text-[#b28c34] transition"
          >
            <input
              type="checkbox"
              checked={activeFilters.brands.includes(o.value)}
              onChange={() => toggle('brands', o.value)}
              className="accent-[#b28c34]"
            />
            {o.label}
          </label>
        ))}
      </Section> */}

      {/* Price Range
      <Section title="Price Range (₹)">
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-[#6b6453]">
            <span>₹{activeFilters.priceRange[0]}</span>
            <span>₹{activeFilters.priceRange[1]}</span>
          </div>

          <div className="relative h-6">
            <input
              type="range"
              min={MIN_PRICE}
              max={MAX_PRICE}
              step="100"
              value={activeFilters.priceRange[0]}
              onChange={(e) => setPrice(0, e.target.value)}
              className="absolute w-full appearance-none bg-transparent accent-[#b28c34] z-20"
            />
            <input
              type="range"
              min={MIN_PRICE}
              max={MAX_PRICE}
              step="100"
              value={activeFilters.priceRange[1]}
              onChange={(e) => setPrice(1, e.target.value)}
              className="absolute w-full appearance-none bg-transparent accent-[#b28c34] z-30"
            />
          </div>
        </div>
      </Section> */}
    </div>
  );

  /* ---------------- MOBILE ---------------- */
  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3 bg-[#1b180d] text-white rounded-md"
        >
          <div className="flex items-center gap-2">
            <Icon name="FunnelIcon" size={18} />
            <span className="font-[Outfit] text-sm font-medium">Filters</span>
          </div>
          {count > 0 && (
            <span className="bg-[#b28c34] text-white text-xs font-medium px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="fixed inset-0 z-[1300] bg-black/40">
            <div className="absolute bottom-0 left-0 right-0 h-[85vh] bg-[#fcfbf8] rounded-t-2xl shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#e7e1cf]">
                <h2 className="font-serif text-lg font-semibold text-[#1b180d]">
                  Filters
                </h2>
                <button onClick={() => setIsOpen(false)}>
                  <Icon name="XMarkIcon" size={22} className="text-[#1b180d]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">{content}</div>

              <div className="p-4 border-t border-[#e7e1cf]">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3 bg-[#b28c34] text-white rounded-md font-[Outfit] font-medium hover:bg-[#9a864c] transition"
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

  /* ---------------- DESKTOP ---------------- */
  return (
    <div
      className={`h-full bg-[#fcfbf8] border border-[#e7e1cf] rounded-xl shadow-sm flex flex-col ${className}`}
    >
      <div className="flex-1 overflow-y-auto">{content}</div>
    </div>
  );
}
