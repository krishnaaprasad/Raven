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
    if (isMobile) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFilterChange?.(filters);
    }, 150);
  };

  const update = (filters) => {
    setActiveFilters(filters);
    applyFilters(filters);
  };

  const toggle = (key, val) => {
    const current = activeFilters[key];
    const updated = current.includes(val)
      ? current.filter((v) => v !== val)
      : [...current, val];

    update({ ...activeFilters, [key]: updated });
  };

  const clearAll = () => {
    const cleared = {
      fragranceFamily: [],
      brands: [],
      priceRange: [MIN_PRICE, MAX_PRICE],
    };

    setActiveFilters(cleared);

    if (!isMobile) {
      onFilterChange?.(cleared);
    }
  };

  const handleApplyMobile = () => {
    onFilterChange?.(activeFilters);
    setIsOpen(false);
  };

  const count = activeFilters.fragranceFamily.length;

  const Section = ({ title, children }) => {
    const [open, setOpen] = useState(true);

    return (
      <div className="border-b border-[#e7e1cf] last:border-b-0">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex justify-between items-center py-4"
        >
          <span className="font-[Outfit] text-sm font-medium text-[#1b180d]">
            {title}
          </span>
          <Icon
            name="ChevronDownIcon"
            size={18}
            className={`text-[#6b6453] transition ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>

        <div
          className={`pb-4 space-y-3 overflow-hidden transition-all duration-300 ${
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
    </div>
  );

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
          <div className="fixed inset-0 z-1300 bg-black/40">
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
                  onClick={handleApplyMobile}
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

  return (
    <div
      className={`h-full bg-[#fcfbf8] border border-[#e7e1cf] rounded-xl shadow-sm flex flex-col ${className}`}
    >
      <div className="flex-1 overflow-y-auto">{content}</div>
    </div>
  );
}
