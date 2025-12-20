const LoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {[...Array(8)].map((_, index) => (
        <div
          key={index}
          className="bg-white border border-[#e7e1cf] rounded-xl overflow-hidden shadow-sm"
        >
          {/* Image skeleton */}
          <div className="aspect-3/4 bg-[#f3f1ea] animate-pulse" />

          {/* Content skeleton */}
          <div className="p-5 space-y-3">
            <div className="h-3 bg-[#f3f1ea] rounded animate-pulse w-1/3" />
            <div className="h-5 bg-[#f3f1ea] rounded animate-pulse w-full" />
            <div className="h-4 bg-[#f3f1ea] rounded animate-pulse w-2/3" />

            <div className="flex items-center space-x-2">
              <div className="h-4 bg-[#f3f1ea] rounded animate-pulse w-20" />
              <div className="h-4 bg-[#f3f1ea] rounded animate-pulse w-16" />
            </div>

            <div className="h-11 bg-[#f3f1ea] rounded-lg animate-pulse w-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
