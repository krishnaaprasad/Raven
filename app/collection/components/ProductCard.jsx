"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/cartcontext";
import { toast } from "react-hot-toast";

const ProductCard = ({ product }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addToCart, openCart } = useCart();
  const router = useRouter();

  const primaryImage =
    typeof product?.images?.[0] === "string"
      ? product.images[0]
      : product?.images?.[0]?.original || null;

  const variant = product?.variants?.[0] || {};
  const price = variant.price ?? 0;
  const size = variant.size ?? "";
  const outOfStock = variant?.stock <= 0;

  return (
    <div
      className="
        group
        bg-(--theme-bg)
        border border-(--theme-border)
        overflow-hidden
        transition-colors duration-500
      "
    >
      {/* IMAGE (bigger visual weight) */}
      <div
  onClick={() => router.push(`/product/${product.slug}`)}
  className="
    relative aspect-4/5 overflow-hidden bg-(--theme-soft)
    cursor-pointer">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-(--theme-soft) animate-pulse" />
        )}

        <Image
          src={primaryImage}
          alt={product?.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      {/* INFO */}
      <div className="px-4 pt-4 pb-5 space-y-2">
        <h3
          onClick={() => router.push(`/product/${product.slug}`)}
          className="
            font-[Crimson_Text]
            text-[16px]
            font-semibold
            text-(--theme-text)
            line-clamp-2
            cursor-pointer
            hover:opacity-80
            transition
          "
        >
          {product.name}
        </h3>

{/* ▸ Accords */}
{product?.accords?.length > 0 && (
  <p
    className="
      text-[9px] sm:text-[10px]
      font-normal
      uppercase
      tracking-[0.18em] sm:tracking-[0.25em]
      font-[system-ui]
      text-(--theme-muted)
      break-words
      leading-relaxed
    "
  >
    {product.accords.slice(0, 3).join(" | ")}
  </p>
)}


     
        {/* Rating (reserve space even if no reviews) */}
<div className="flex items-center gap-2 min-h-[18px]">
  {product?.reviewCount > 0 && product?.rating != null ? (
    <>
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={13}
            className={
              i < Math.round(product.rating)
                ? "text-(--theme-text) fill-(--theme-text)"
                : "text-(--theme-border)"
            }
          />
        ))}
      </div>
      
      <span className="font-[system-ui] text-xs text-(--theme-muted) group-hover:text-(--theme-text) transition-colors">
      {product.reviewCount}{" "}
      {product.reviewCount === 1 ? "review" : "reviews"}
    </span>
    </>
  ) : (
    // 👇 invisible placeholder to preserve height
    <span className="text-xs opacity-0">0.0</span>
    
  )}
</div>



        {/* Price */}
        <p className="font-[Crimson_Text] text-lg font-semibold text-(--theme-text)">
          ₹{price.toLocaleString("en-IN")}
        </p>

        {/* Button */}
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
                background: "var(--theme-bg)",
                color: "var(--theme-text)",
                border: "1px solid var(--theme-border)",
              },
            });

            setTimeout(() => openCart(), 50);
          }}
          className={`
            w-full py-2.5
            text-xs uppercase tracking-widest
            border transition
            flex items-center justify-center gap-2
            ${
              outOfStock
                ? "bg-(--theme-soft) text-(--theme-muted) cursor-not-allowed border-(--theme-border)"
                : "bg-(--theme-bg) text-(--theme-text) border-(--theme-border) hover:bg-(--theme-soft)"
            }
          `}
        >
          <ShoppingBag size={16} />
          {outOfStock ? "Out of Stock" : "Add to Bag"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
