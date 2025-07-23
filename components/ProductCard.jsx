export default function ProductCard({ img, alt, name, price }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition transform hover:scale-105">
      <div className="w-full aspect-[3/4] bg-[#FFF9E7]">
        <img src={img} alt={alt} className="object-cover w-full h-full" />
      </div>
      <div className="p-6 flex flex-col items-center">
        <span className="text-lg font-bold text-[#191919] mb-1">{name}</span>
        <span className="text-[#B4933A] font-semibold mb-3">{price}</span>
        <button className="px-5 py-2 bg-black text-[#FFE186] font-semibold rounded-full shadow hover:bg-[#232020] transition">
          Add to Cart
        </button>
      </div>
    </div>
  );
}