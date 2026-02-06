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
    <div className="p-8 space-y-5 bg-(--theme-soft) border border-[var(--theme-border)] transition-colors duration-500">

      {/* Header */}
      <div className="flex justify-between items-center pb-6 border-b border-[var(--theme-border)]">
        <div className="flex items-center gap-3">
          <Funnel size={16} className="text-[var(--theme-text)]" />
          <span className="text-xs tracking-[0.25em] uppercase text-[var(--theme-text)] font-medium">
            Discover by Intention
          </span>

          {count > 0 && (
            <span className="text-[11px] bg-[var(--theme-text)] text-[var(--theme-bg)] px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>

        {count > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-[var(--theme-muted)] hover:text-[var(--theme-text)] underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Section */}
      <div className="space-y-6">
        <p className="text-sm text-[var(--theme-muted)]">Fragrance Family</p>

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
                      ? "bg-[var(--theme-text)] text-[var(--theme-bg)] border-[var(--theme-text)]"
                      : "bg-[var(--theme-bg)] text-[var(--theme-text)] border-[var(--theme-border)] hover:border-[var(--theme-text)]"
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
          className="w-full border border-[var(--theme-border)] px-4 py-3 flex justify-between items-center bg-[var(--theme-bg)] transition-colors duration-500"
        >
          <span className="text-xs tracking-widest uppercase text-[var(--theme-text)]">
            Filters
          </span>

          {count > 0 && (
            <span className="text-[11px] border border-[var(--theme-border)] px-2 py-0.5 rounded-full text-[var(--theme-muted)]">
              {count}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="fixed inset-0 z-50 bg-black/30">
            <div className="absolute bottom-0 left-0 right-0 bg-[var(--theme-bg)] rounded-t-2xl max-h-[85vh] flex flex-col transition-colors duration-500">
              <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--theme-border)]">
                <span className="text-xs tracking-widest uppercase text-[var(--theme-text)]">
                  Filters
                </span>
                <button onClick={() => setIsOpen(false)}>
                  <X size={18} className="text-[var(--theme-text)]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">{content}</div>

              <div className="p-4 border-t border-[var(--theme-border)]">
                <button
                  onClick={handleApplyMobile}
                  className="w-full py-3 border border-[var(--theme-text)] text-[var(--theme-text)] hover:bg-[var(--theme-soft)] transition"
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
        <div className="border border-[var(--theme-border)] bg-[var(--theme-soft)] transition-colors duration-500">
          {content}
        </div>
      </div>
    </div>
  );
}
