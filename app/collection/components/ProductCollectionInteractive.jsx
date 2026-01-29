'use client';

import { useState, useEffect, useCallback } from 'react';
import ProductGridNavigation from '@/components/shoppage/ProductGridNavigation';
import ProductGrid from './ProductGrid';
import LoadingSkeleton from './LoadingSkeleton';
import { ArrowUp, CheckCircle } from 'lucide-react';
import { useCart } from '@/app/context/cartcontext';
import { useQuickView } from "@/app/context/QuickViewContext";

const ProductCollectionInteractive = ({ initialProducts }) => {
  const { addToCart, openCart } = useCart();
  const [products] = useState(initialProducts || []);
  const [filteredProducts, setFilteredProducts] = useState(initialProducts || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const { openQuickView } = useQuickView();
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [cartNotification, setCartNotification] = useState(null);

  const productsPerPage = 24;

  /* Scroll to top visibility */
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ---------------- SORTING ---------------- */
  const applySorting = useCallback(
    (sortValue) => {
      let sorted = [...filteredProducts];

      switch (sortValue) {
        case 'price-low':
          sorted.sort(
            (a, b) =>
              (a?.variants?.[0]?.price || 0) -
              (b?.variants?.[0]?.price || 0)
          );
          break;
        case 'price-high':
          sorted.sort(
            (a, b) =>
              (b?.variants?.[0]?.price || 0) -
              (a?.variants?.[0]?.price || 0)
          );
          break;
        case 'name-asc':
          sorted.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name-desc':
          sorted.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'rating':
          sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'newest':
          sorted.sort(
            (a, b) =>
              new Date(b.createdAt) - new Date(a.createdAt)
          );
          break;
        default:
          break;
      }

      setFilteredProducts(sorted);
    },
    [filteredProducts]
  );

  const handleSortChange = (value) => {
    setSortBy(value);
    applySorting(value);
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
              loading={isLoading}
            />

            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <ProductGrid
                products={paginatedProducts}
                onQuickView={openQuickView}
                onAddToCart={handleAddToCart}
                viewMode={viewMode}
              />
            )}

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

      {/* Cart Toast */}
      {cartNotification && (
        <div className="
          fixed bottom-8 right-8 z-50
          bg-[var(--theme-bg)]
          text-[var(--theme-text)]
          border border-[var(--theme-border)]
          px-6 py-4 rounded-lg shadow-lg
          flex items-center gap-3
        ">
          <CheckCircle size={22} />
          <span className="font-[Outfit] text-sm font-medium">
            {cartNotification}
          </span>
        </div>
      )}

      {/* Scroll Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
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
