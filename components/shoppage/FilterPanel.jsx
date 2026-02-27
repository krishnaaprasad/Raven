'use client';

import { useState, useRef, useMemo,useEffect  } from 'react';
import { Funnel, X } from 'lucide-react';

export default function FilterPanel({
  onFilterChange,
  initialFilters = {},
  isMobile = false,
}) {
  const [isOpen, setIsOpen] = useState(!isMobile);

  const [activeFilters, setActiveFilters] = useState(initialFilters);
  useEffect(() => {
  setActiveFilters(initialFilters);
}, [initialFilters]);

  const debounceRef = useRef(null);

  const options = useMemo(
    () => ({
      accords: [
        { value: 'floral', label: 'Floral' },
        { value: 'woody', label: 'Woody' },
        { value: 'spicy', label: 'Spicy' },
        { value: 'fruity', label: 'Fruity' },
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
    const current = activeFilters.accords;

    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    const next = { accords: updated };

    setActiveFilters(next);

    if (!isMobile) applyFilters(next);
  };

  const clearAll = () => {
    const cleared = { accords: [] };
    setActiveFilters(cleared);
    onFilterChange?.(cleared);
  };

  const handleApplyMobile = () => {
    onFilterChange?.(activeFilters);
    setIsOpen(false);
  };

  const count = activeFilters.accords.length;

  const content = (
    <div className="p-8 space-y-5 bg-(--theme-soft) border border-(--theme-border) transition-colors duration-500">

      {/* Header */}
      <div className="flex justify-between items-center pb-6 border-b border-(--theme-border)">
        <div className="flex items-center gap-3">
          <Funnel size={16} className="text-(--theme-text)" />
          <span className="text-xs tracking-[0.25em] uppercase text-(--theme-text) font-medium">
            Discover by Intention
          </span>

          {count > 0 && (
            <span className="text-[11px] bg-(--theme-text) text-(--theme-bg) px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>

        {count > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-(--theme-muted) hover:text-(--theme-text) underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Section */}
      <div className="space-y-6">
        <p className="text-sm text-(--theme-muted)">Signature Accords</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {options.accords.map((o) => {
            const active = activeFilters.accords.includes(o.value);

            return (
              <button
                key={o.value}
                onClick={() => toggle(o.value)}
                className={`
                  py-3 px-4 text-xs tracking-[0.2em] uppercase transition-all duration-300
                  border rounded-md
                  ${
                    active
                      ? "bg-(--theme-text) text-(--theme-bg) border-(--theme-text)"
                      : "bg-(--theme-bg) text-(--theme-text) border-(--theme-border) hover:border-(--theme-text)"
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
          className="w-full border border-(--theme-border) px-4 py-3 flex justify-between items-center bg-(--theme-bg) transition-colors duration-500"
        >
          <span className="text-xs tracking-widest uppercase text-(--theme-text)">
            Filters
          </span>

          {count > 0 && (
            <span className="text-[11px] border border-(--theme-border) px-2 py-0.5 rounded-full text-(--theme-muted)">
              {count}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="fixed inset-0 z-50 bg-black/30">
            <div className="absolute bottom-0 left-0 right-0 bg-(--theme-bg) rounded-t-2xl max-h-[85vh] flex flex-col transition-colors duration-500">
              <div className="flex justify-between items-center px-6 py-4 border-b border-(--theme-border)">
                <span className="text-xs tracking-widest uppercase text-(--theme-text)">
                  Filters
                </span>
                <button onClick={() => setIsOpen(false)}>
                  <X size={18} className="text-(--theme-text)" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">{content}</div>

              <div className="p-4 border-t border-(--theme-border)">
                <button
                  onClick={handleApplyMobile}
                  className="w-full py-3 border border-(--theme-text) text-(--theme-text) hover:bg-(--theme-soft) transition"
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
        <div className="border border-(--theme-border) bg-(--theme-soft) transition-colors duration-500">
          {content}
        </div>
      </div>
    </div>
  );
}
