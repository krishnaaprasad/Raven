// Fields that must never reach the storefront: internal cost / margin data per variant.
// Use with .select(PUBLIC_PRODUCT_FIELDS) on every public Product query.
export const PUBLIC_PRODUCT_FIELDS = [
  "-__v",
  "-variants.oil_cost",
  "-variants.packaging_cost",
  "-variants.other_cost",
  "-variants.total_cost",
  "-variants.cost_items",
].join(" ");
