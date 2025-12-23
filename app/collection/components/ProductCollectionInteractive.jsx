'use client';

import { useState, useEffect, useCallback } from 'react';
import FilterPanel from '@/components/shoppage/FilterPanel';
import ProductGridNavigation from '@/components/shoppage/ProductGridNavigation';
import ProductGrid from './ProductGrid';
import QuickViewModal from './QuickViewModal';
import LoadingSkeleton from './LoadingSkeleton';
import { ArrowUp, CheckCircle } from 'lucide-react';
import { useCart } from '@/app/context/cartcontext';

const ProductCollectionInteractive = ({ initialProducts }) => {
  const { addToCart, openCart } = useCart();
  const [products] = useState(initialProducts || []);
  const [filteredProducts, setFilteredProducts] = useState(initialProducts || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    fragranceFamily: [],
    brands: [],
    priceRange: [0, 20000],
    });
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
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
  /* ---------------- FILTER LOGIC ---------------- */
const applyFilters = useCallback(
  (filters) => {
    let filtered = [...products];

    if (filters?.fragranceFamily?.length > 0) {
      filtered = filtered.filter((p) =>
        filters.fragranceFamily.includes(
          p?.fragranceType?.toLowerCase()
        )
      );
    }

    if (filters?.brands?.length > 0) {
      filtered = filtered.filter((p) =>
        filters.brands.includes(
          p?.brand?.toLowerCase()?.replace(/\s+/g, '-')
        )
      );
    }

    // Price from variants
    filtered = filtered.filter((p) => {
      const price = p?.variants?.[0]?.price || 0;
      return (
        price >= filters.priceRange[0] &&
        price <= filters.priceRange[1]
      );
    });

    setFilteredProducts(filtered);
    setCurrentPage(1);
  },
  [products]
);


  /* ---------------- HANDLERS ---------------- */
  const handleFilterChange = (f) => {
  setFilters(f);
  setIsLoading(true);
  setTimeout(() => {
    applyFilters(f);
    setIsLoading(false);
  }, 200);
};


  

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

  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
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
    <div className="min-h-screen bg-[#fcfbf8]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Filters */}
          <aside className="hidden lg:block w-80 shrink-0">
        <div className="sticky top-24 h-[calc(100vh-6rem)]">
            <FilterPanel
            onFilterChange={handleFilterChange}
            className="h-full"
            />
        </div>
        </aside>


          {/* Products */}
          <div className="flex-1 min-w-0">
            <div className="lg:hidden mb-6">
              <FilterPanel
                onFilterChange={handleFilterChange}
                isMobile
              />
            </div>

            {/* Applied Filters */}
{(filters.fragranceFamily.length > 0 ||
  filters.brands.length > 0) && (
  <div className="flex flex-wrap gap-2 mb-5">
    {filters.fragranceFamily.map((f) => (
      <span
        key={f}
        className="px-3 py-1 bg-[#f3efe3] text-[#1b180d] text-xs rounded-full"
      >
        {f}
      </span>
    ))}
    {filters.brands.map((b) => (
      <span
        key={b}
        className="px-3 py-1 bg-[#f3efe3] text-[#1b180d] text-xs rounded-full"
      >
        {b.replace('-', ' ')}
      </span>
    ))}
    <span className="px-3 py-1 bg-[#f3efe3] text-xs rounded-full">
      ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
    </span>
  </div>
)}


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
                onQuickView={handleQuickView}
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

      {/* Quick View */}
      <QuickViewModal
        product={selectedProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Toast */}
      {cartNotification && (
        <div className="fixed bottom-8 right-8 z-50 bg-[#2e7d32] text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
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
          className="fixed bottom-8 left-8 z-50 w-12 h-12 bg-[#b28c34] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#9a864c] transition">
          <ArrowUp size={22} />
        </button>
      )}

  {(filters.fragranceFamily.length > 0 ||
    filters.brands.length > 0) && (
  <div className="flex flex-wrap gap-2 mb-5">
    {filters.fragranceFamily.map((f) => (
      <button
        key={f}
        onClick={() =>
          handleFilterChange({
            ...filters,
            fragranceFamily: filters.fragranceFamily.filter(
              (x) => x !== f
            ),
          })
        }
        className="flex items-center gap-1 px-3 py-1 bg-[#f3efe3] text-[#1b180d] text-xs rounded-full hover:bg-[#e7e1cf]"
      >
        {f.replace('-', ' ')}
        <span>✕</span>
      </button>
    ))}

    {filters.brands.map((b) => (
      <button
        key={b}
        onClick={() =>
          handleFilterChange({
            ...filters,
            brands: filters.brands.filter((x) => x !== b),
          })
        }
        className="flex items-center gap-1 px-3 py-1 bg-[#f3efe3] text-[#1b180d] text-xs rounded-full hover:bg-[#e7e1cf]"
      >
        {b.replace('-', ' ')}
        <span>✕</span>
      </button>
    ))}

    <span className="px-3 py-1 bg-[#f3efe3] text-xs rounded-full">
      ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
    </span>
  </div>
)}

    </div>
  );
};

export default ProductCollectionInteractive;
