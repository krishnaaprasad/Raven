import ProductCard from './ProductCard';

const ProductGrid = ({
  products,
  onQuickView,
  onAddToCart,
  viewMode,
}) => {
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-24 h-24 mb-6 text-[#bdb6a5]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.5 16C10.8807 16 12 14.8807 12 13.5C12 12.1193 10.8807 11 9.5 11C8.11929 11 7 12.1193 7 13.5C7 14.8807 8.11929 16 9.5 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14.5 16C15.8807 16 17 14.8807 17 13.5C17 12.1193 15.8807 11 14.5 11C13.1193 11 12 12.1193 12 13.5C12 14.8807 13.1193 16 14.5 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 11V7C9 5.89543 9.89543 5 11 5H13C14.1046 5 15 5.89543 15 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 5V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h3 className="font-serif text-xl font-semibold text-[#1b180d] mb-2">
          No Products Found
        </h3>
        <p className="text-sm font-[Outfit] text-[#6b6453] text-center max-w-md">
          We couldn’t find any fragrances matching your filters. Try adjusting your search or clearing some options.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`grid gap-8 ${
        viewMode === 'list'
          ? 'grid grid-cols-2 gap-4'
          : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6'
      }`}
    >
      {products.map((product, index) => {
  const key =
    product?._id?.toString?.() ||
    product?.slug ||
    `product-${index}`;

  return (
    <ProductCard
      key={key}
      product={product}
      onQuickView={onQuickView}
      onAddToCart={onAddToCart}
    />
  );
})}

    </div>
  );
};

export default ProductGrid;
