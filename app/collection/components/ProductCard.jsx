"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, Star, ShoppingBag, Sparkles } from "lucide-react";
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
  const size = variant.size ?? "";
  const outOfStock = variant?.stock <= 0;

  return (
    <div
      className="
        group relative
        bg-(--theme-bg)
        border border-(--theme-border)
        overflow-hidden
        transition-colors duration-500
      "
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* IMAGE */}
      <div className="relative aspect-3/4 overflow-hidden bg-(--theme-soft)">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-(--theme-soft) animate-pulse" />
        )}

        <Image
          src={primaryImage}
          alt={product?.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onLoad={() => setImageLoaded(true)}
        />

        {isHovered && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <button
              onClick={() => onQuickView?.(product)}
              className="
                flex items-center gap-2
                px-6 py-3
                bg-(--theme-bg)
                text-(--theme-text)
                border border-(--theme-border)
                text-sm uppercase tracking-widest
                hover:bg-(--theme-soft)
                transition
              "
            >
              <Eye size={18} />
              Quick View
            </button>
          </div>
        )}
      </div>

      {/* INFO */}
      <div className="p-5 space-y-3">
        <h3
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/product/${product.slug}`);
          }}
          className="
            font-[Crimson_Text]
            text-base font-semibold
            text-(--theme-text)
            line-clamp-2 cursor-pointer
            hover:opacity-80 transition
          "
        >
          {product.name}
        </h3>

        {isHovered && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-(--theme-muted) text-xs">
              <Sparkles size={14} />
              {product?.fragranceType}
            </div>

            <div className="flex flex-wrap gap-1">
              {product?.topNotes?.slice(0, 3)?.map((note, i) => (
                <span
                  key={i}
                  className="
                    px-2 py-1
                    bg-(--theme-soft)
                    text-(--theme-muted)
                    text-xs rounded
                  "
                >
                  {note}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* RATING */}
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={
                  i < Math.floor(product?.rating || 0)
                    ? "text-(--theme-text) fill-(--theme-text)"
                    : "text-(--theme-border)"
                }
              />
            ))}
          </div>
          <span className="text-xs text-(--theme-muted)">
            {product?.rating} ({product?.reviewCount || 0})
          </span>
        </div>

        {/* PRICE */}
        <p className="font-[Crimson_Text] text-lg font-semibold text-(--theme-text)">
          ₹{price.toLocaleString("en-IN")}
        </p>

        {/* ADD TO CART */}
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
            w-full py-3
            text-sm uppercase tracking-widest
            border transition
            flex items-center justify-center gap-2
            ${
              outOfStock
                ? "bg-(--theme-soft) text-(--theme-muted) cursor-not-allowed border-(--theme-border)"
                : "bg-(--theme-bg) text-(--theme-text) border-(--theme-border) hover:bg-(--theme-soft)"
            }
          `}
        >
          <ShoppingBag size={18} />
          {outOfStock ? "Out of Stock" : "Add to Bag"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
