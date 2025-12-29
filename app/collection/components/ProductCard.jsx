'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Eye, Star, ShoppingBag, Sparkles } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/cartcontext";
import { toast } from "react-hot-toast";

const ProductCard = ({ product, onQuickView }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart, openCart } = useCart();
  const router = useRouter();

const primaryImage =
  typeof product?.images?.[0] === "string"
    ? product.images[0]
    : product?.images?.[0]?.original || null;


  const variant = product?.variants?.[0] || {};
  const price = variant.price ?? 0;
  const size = variant.size ?? '';
  const outOfStock = variant?.stock <= 0;

  return (
    <div
      className="group relative bg-white border border-[#e7e1cf] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-3/4 overflow-hidden bg-[#f3f1ea]">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-[#f3f1ea] animate-pulse" />
        )}

        <Image
          src={primaryImage}
          alt={product?.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onLoad={() => setImageLoaded(true)}
        />

        {isHovered && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <button
              onClick={() => onQuickView(product)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-[#1b180d] rounded-md font-[Outfit] text-sm font-medium hover:bg-[#b28c34] hover:text-white transition"
            >
              <Eye size={18} />
              Quick View
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-[#6b6453] font-[Outfit] mb-1">
            {product?.brand}
          </p>
          <h3
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/product/${product.slug}`);
            }}
            className="font-serif text-base font-semibold text-[#1b180d] line-clamp-2 cursor-pointer hover:text-[#b28c34] transition">
            {product.name}
          </h3>
        </div>

        {isHovered && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#b28c34]" />
              <span className="text-xs text-[#6b6453] font-[Outfit]">
                {product?.fragranceType}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {product?.topNotes?.slice(0, 3)?.map((note, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-[#f3f1ea] text-[#6b6453] text-xs rounded"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={
                  i < Math.floor(product?.rating || 0)
                    ? 'text-[#b28c34] fill-[#b28c34]'
                    : 'text-[#d1cbb8]'
                }
              />
            ))}
          </div>
          <span className="text-xs text-[#6b6453] font-[Outfit]">
            {product?.rating} ({product?.reviewCount || 0})
          </span>
        </div>

        {/* Price */}
        <div>
          <p className="font-serif text-lg font-semibold text-[#1b180d]">
            ₹{price.toLocaleString('en-IN')}
          </p>
         
        </div>

        {/* Add to cart */}
        <button
          disabled={outOfStock}
          onClick={() => {
          if (outOfStock) return;

          addToCart(
            {
              id: product._id,
              name: product.name,
              slug: product.slug,
              price: Number(price) || 0,
              image: primaryImage,
              size: size || "",
            },
            1
          );

          toast.success(`${product.name} added to cart`, {
            style: {
              background: "#1b180d",
              color: "#fff",
              border: "1px solid #B28C34",
            },
          });

          setTimeout(() => openCart(), 50);
        }}
          className={`w-full py-3 rounded-md font-[Outfit] text-sm font-medium transition flex items-center justify-center gap-2 ${
            outOfStock
              ? 'bg-[#d6cfbd] text-white cursor-not-allowed'
              : 'bg-[#b28c34] text-white hover:bg-[#9a864c]'
          }`}
        >
          <ShoppingBag size={18} />
          {outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
