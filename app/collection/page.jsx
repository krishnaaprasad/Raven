export const dynamic = "force-dynamic";

import SearchComponent from '@/components/shoppage/SearchComponent';
import ProductCollectionInteractive from './components/ProductCollectionInteractive';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';

// ✅ SEO metadata (optimized)
export const metadata = {
  title: 'Luxury Perfume Collection for Men & Women | Raven Fragrance India',
  description:
    'Shop luxury perfumes for men and women at Raven Fragrance. Explore premium floral, woody, oriental and fresh fragrances crafted for long-lasting elegance. Free delivery across India.',
  keywords: [
    'luxury perfumes India',
    'premium fragrances online',
    'perfume for men and women',
    'Raven Fragrance perfumes',
    'long lasting perfumes',
    'buy perfume online India',
    'floral woody oriental perfumes'
  ],
  alternates: {
    canonical: 'https://ravenfragrance.in/collection',
  },
};

export default async function ProductCollectionPage() {
  await connectToDatabase();

  let products = [];

  try {
    const rawProducts = await Product.find({ deleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean();

    // ✅ Ensure plain objects for Client Components
    products = JSON.parse(JSON.stringify(rawProducts));
  } catch (error) {
    console.error('❌ Failed to load products:', error);
  }

  return (
    <main className=" min-h-screen bg-[#fcfbf8]">
      {/* 🔝 Header */}
      {/* 🔝 Header */}
<section className="bg-[#f9f6ef] border-b border-[#e7e1cf]">
  <div className="max-w-[1100px] mx-auto px-6 py-8 text-center">
    
    <h1 className="font-[Cormorant_Garamond] text-3xl sm:text-4xl md:text-5xl font-semibold text-[#1b180d] mb-4 leading-tight">
      Luxury Perfume Collection for Men & Women
    </h1>

    <p className="font-[Outfit] text-base sm:text-lg text-[#6b6453] max-w-2xl mx-auto mb-8">
      Discover Raven Fragrance’s luxury perfumes — premium Raven perfumes for men & women with long-lasting, elegant scents.
    </p>

    {/* Search */}
    <div className="max-w-xl mx-auto font-[Outfit]">
      <SearchComponent placeholder="Search luxury fragrances, brands, notes..." />
    </div>

  </div>
</section>


      {/* 🛍 Collection */}
      <ProductCollectionInteractive initialProducts={products} />
    </main>
  );
}
