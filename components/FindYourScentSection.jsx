import ProductCard from "./ProductCard";

const products = [
  {
    img: "/1.png",
    alt: "Dark Rebel",
    name: "Dark Rebel",
    price: "₹699 INR",
  },
  {
    img: "/2.png",
    alt: "Italian Gardenia",
    name: "Italian Gardenia",
    price: "₹749 INR",
  },
  {
    img: "/3.png",
    alt: "Morning Blossom",
    name: "Morning Blossom",
    price: "₹499 INR",
  },
  {
    img: "/4.png",
    alt: "Candy Rose",
    name: "Candy Rose",
    price: "₹899 INR",
  },
];

export default function FindYourScentSection() {
  return (
    <section className="bg-gradient-to-b from-[#E6D8A8] via-[#C9B77E] to-[#E3C987] py-14">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Title */}
        <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#191919] uppercase tracking-wide mb-5 text-center">
          Find Your Signature Scent
        </h2>
        {/* Subtext */}
        <p className="text-base sm:text-lg text-[#9F885B] text-center max-w-xl mx-auto mb-10 font-medium">
          A crystal-clear glass bottle tinted with vibrant pink energy. The juice inside? A blast of freshness, ready to ignite the senses.
        </p>
        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.name} {...product} />
          ))}
        </div>
        {/* View All Perfumes Button */}
        <div className="flex justify-center mt-12">
          <button className="px-8 py-3 bg-[#191919] text-[#FFE186] text-base font-bold rounded-full shadow hover:bg-[#232020] transition">
            View All Perfumes
          </button>
        </div>
      </div>
    </section>
  );
}
