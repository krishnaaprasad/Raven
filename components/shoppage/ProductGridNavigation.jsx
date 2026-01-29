'use client';

import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price-low', label: 'Price: Low → High' },
  { value: 'price-high', label: 'Price: High → Low' },
  { value: 'name-asc', label: 'Name: A → Z' },
  { value: 'name-desc', label: 'Name: Z → A' },
  { value: 'rating', label: 'Highest Rated' },
];

export default function ProductGridNavigation({
  totalProducts = 0,
  currentPage = 1,
  productsPerPage = 24,
  onPageChange,
  onSortChange,
  onViewChange,
  className = '',
}) {
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const start = (currentPage - 1) * productsPerPage + 1;
  const end = Math.min(currentPage * productsPerPage, totalProducts);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleSort = (v) => {
    setSortBy(v);
    setOpen(false);
    onSortChange?.(v);
  };

  return (
    <div
      className={`
        w-full 
        bg-(--theme-bg)
        px-4 py-4 space-y-3
        transition-colors duration-500
        ${className}
      `}
    >
      {/* 🔝 Top Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-(--theme-muted) font-[Outfit]">
          Showing{' '}
          <span className="text-(--theme-text) font-medium">{start}-{end}</span> of{' '}
          <span className="text-(--theme-text) font-medium">{totalProducts}</span>
        </p>

        {/* Sort + View */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Sort Dropdown */}
          <div className="relative w-full sm:w-60" ref={ref}>
            <button
              onClick={() => setOpen(!open)}
              className="
                w-full flex items-center justify-between
                px-4 py-2.5
                bg-(--theme-bg)
                border border-(--theme-border)
                rounded-md
                text-sm font-[Outfit]
                text-(--theme-text)
                hover:bg-(--theme-soft)
                transition-colors duration-300
              "
            >
              <div className="flex items-center gap-2 truncate">
                <Icon name="BarsArrowDownIcon" size={16} />
                <span className="truncate">
                  {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                </span>
              </div>
              <Icon name="ChevronDownIcon" size={14} />
            </button>

            {open && (
              <div
                className="
                  absolute left-0 right-0 mt-2
                  bg-(--theme-bg)
                  border border-(--theme-border)
                  rounded-lg
                  shadow-lg z-50 overflow-hidden
                "
              >
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => handleSort(o.value)}
                    className={`
                      w-full px-4 py-3
                      flex items-center justify-between
                      text-sm font-[system-ui]
                      transition-colors duration-200
                      ${
                        sortBy === o.value
                          ? 'bg-(--theme-soft) text-(--theme-text)'
                          : 'text-(--theme-text) hover:bg-(--theme-soft)'
                      }
                    `}
                  >
                    <span>{o.label}</span>
                    {sortBy === o.value && (
                      <Icon
                        name="CheckIcon"
                        size={16}
                        className="text-(--theme-text)"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View Toggle (desktop only) */}
          <div className="hidden sm:flex items-center border border-(--theme-border) rounded-md overflow-hidden">
            <button
              onClick={() => {
                setViewMode('grid');
                onViewChange?.('grid');
              }}
              className={`p-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-(--theme-soft) text-(--theme-text)'
                  : 'text-(--theme-muted) hover:text-(--theme-text)'
              }`}
            >
              <Icon name="Squares2X2Icon" size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
