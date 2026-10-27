// Validates and prices the product lines of an admin (manual) order.
// Shared by "Create manual order" and "Edit manual order".

import Product from "@/models/Product";

export const MAX_MANUAL_LINES = 20;

/**
 * @param {Array<{slug?: string, productId?: string, variantSize: string, quantity: any, price?: any}>} rawItems
 * @returns {Promise<{ ok: true, lines: Array, subtotal: number } | { ok: false, error: string }>}
 */
export async function buildManualLines(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { ok: false, error: "Add at least one product" };
  }
  if (rawItems.length > MAX_MANUAL_LINES) {
    return { ok: false, error: `At most ${MAX_MANUAL_LINES} products per order` };
  }

  // Same product + size + price on two rows → one line
  const merged = new Map();

  for (const [i, raw] of rawItems.entries()) {
    const row = `Row ${i + 1}`;
    const ref = raw?.slug ? { slug: String(raw.slug) } : raw?.productId ? { _id: String(raw.productId) } : null;
    if (!ref || !raw?.variantSize) {
      return { ok: false, error: `${row}: choose a product and size` };
    }

    const product = await Product.findOne(ref).lean().catch(() => null);
    if (!product) return { ok: false, error: `${row}: product not found` };

    const variant = product.variants?.find((v) => String(v.size) === String(raw.variantSize));
    if (!variant) return { ok: false, error: `${row}: size ${raw.variantSize} not found for ${product.name}` };

    const quantity = Number(raw.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      return { ok: false, error: `${row}: quantity must be a whole number of at least 1` };
    }

    const price = raw.price === "" || raw.price == null ? Number(variant.price) : Number(raw.price);
    if (!Number.isFinite(price) || price < 0) {
      return { ok: false, error: `${row}: invalid price` };
    }

    const key = `${product.slug}|${variant.size}|${price}`;
    const existing = merged.get(key);
    if (existing) {
      existing.quantity += quantity;
    } else {
      merged.set(key, {
        name: product.name,
        size: String(variant.size),
        price,
        quantity,
        image: product.images?.[0]?.original || product.images?.[0]?.thumbnail || "",
        slug: product.slug,
      });
    }
  }

  const lines = [...merged.values()];
  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  return { ok: true, lines, subtotal };
}

/** Quantity per "slug|size" — used to work out stock changes when an order is edited. */
export function qtyBySku(lines = []) {
  const map = new Map();
  for (const l of lines) {
    const key = `${l.slug}|${l.size}`;
    map.set(key, (map.get(key) || 0) + Number(l.quantity || 0));
  }
  return map;
}
