'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FilterPanel from '@/components/shoppage/FilterPanel';
import ProductCollectionInteractive from './ProductCollectionInteractive';

export default function CollectionClientWrapper({ initialProducts }) {
  const router = useRouter();

  const [activeFilters, setActiveFilters] = useState({ accords: [] });

  // 🔹 Read filters from URL on first load
  // (window.location instead of useSearchParams so the cached page still server-renders the grid)
  useEffect(() => {
    const accordsParam = new URLSearchParams(window.location.search).get("accords");

    if (accordsParam) {
      setActiveFilters({
        accords: accordsParam.split(",")
      });
    }
  }, []);

  // 🔹 Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();

    if (activeFilters?.accords?.length) {
      params.set("accords", activeFilters.accords.join(","));
    }

    router.replace(`/collection?${params.toString()}`, { scroll: false });

  }, [activeFilters]);

  return (
    <>
      <FilterPanel
        onFilterChange={setActiveFilters}
        initialFilters={activeFilters}
      />
      <ProductCollectionInteractive
        initialProducts={initialProducts}
        activeFilters={activeFilters}
      />
    </>
  );
}