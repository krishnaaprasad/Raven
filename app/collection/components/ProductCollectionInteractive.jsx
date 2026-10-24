'use client';

import { useState, useEffect, useMemo } from 'react';
import ProductGridNavigation from '@/components/shoppage/ProductGridNavigation';
import ProductGrid from './ProductGrid';
import { ArrowUp } from 'lucide-react';
import { useCart } from '@/app/context/cartcontext';
import { useQuickView } from "@/app/context/QuickViewContext";
import { motion, AnimatePresence } from "framer-motion";

const ProductCollectionInteractive = ({ initialProducts, activeFilters }) => {
  const { addToCart, openCart } = useCart();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const { openQuickView } = useQuickView();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const productsPerPage = 24;

  /* Scroll to top visibility */
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  /* ---------------- FILTER + SORT ----------------
     Always derived from the original list, so "Featured" restores the original order
     and switching sorts never compounds a previous sort. */
  const filteredProducts = useMemo(() => {
    let list = [...(initialProducts || [])];

    if (activeFilters?.accords?.length) {
      list = list.filter((product) =>
        product.accords?.some((a) => activeFilters.accords.includes(a.toLowerCase()))
      );
    }

    const price = (p) => p?.variants?.[0]?.price || 0;
    switch (sortBy) {
      case 'price-low':
        list.sort((a, b) => price(a) - price(b));
        break;
      case 'price-high':
        list.sort((a, b) => price(b) - price(a));
        break;
      case 'name-asc':
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-desc':
        list.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'rating':
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break; // featured = original order
    }
    return list;
  }, [initialProducts, activeFilters, sortBy]);

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleViewChange = (mode) => {
    setViewMode(mode);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (item) => {
    if (!item) return;

    const variant = item?.variants?.[0] || {};
    const price = Number(variant.price) || 0;

    addToCart(
      {
        id: item._id,
        name: item.name,
        slug: item.slug,
        price,
        image: item?.images?.[0]?.original || "",
        size: variant.size || "",
      },
      1
    );

    openCart();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ---------------- PAGINATION ---------------- */
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  // Back to page 1 whenever the filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilters]);

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] transition-colors duration-500">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-3">
        <div className="flex flex-col gap-10">

          {/* Products */}
          <div className="flex-1 min-w-0">
            <ProductGridNavigation
              totalProducts={filteredProducts.length}
              currentPage={currentPage}
              productsPerPage={productsPerPage}
              onPageChange={handlePageChange}
              onSortChange={handleSortChange}
              onViewChange={handleViewChange}
            />

            
              <AnimatePresence mode="wait">
  <motion.div
    key={JSON.stringify(activeFilters)}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    <ProductGrid
      products={paginatedProducts}
      onQuickView={openQuickView}
      onAddToCart={handleAddToCart}
      viewMode={viewMode}
    />
  </motion.div>
</AnimatePresence>
            {filteredProducts.length > productsPerPage && (
              <div className="mt-10">
                <ProductGridNavigation
                  totalProducts={filteredProducts.length}
                  currentPage={currentPage}
                  productsPerPage={productsPerPage}
                  onPageChange={handlePageChange}
                  onSortChange={handleSortChange}
                  onViewChange={handleViewChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Scroll Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="
            fixed bottom-8 left-8 z-50
            w-12 h-12 rounded-full
            bg-[var(--theme-bg)]
            border border-[var(--theme-border)]
            text-[var(--theme-text)]
            shadow-lg
            flex items-center justify-center
            hover:bg-[var(--theme-soft)]
            transition
          "
        >
          <ArrowUp size={22} />
        </button>
      )}
    </div>
  );
};

export default ProductCollectionInteractive;
