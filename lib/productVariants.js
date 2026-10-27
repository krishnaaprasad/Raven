// Normalises variants coming from the admin Add/Edit Product forms.
// Keeps the cost fields — they were previously dropped on every save, wiping COGS/P&L data.

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

export function normalizeVariant(v) {
  const costItems = Array.isArray(v.cost_items)
    ? v.cost_items
        .filter((ci) => ci && typeof ci.label === "string" && ci.label.trim())
        .map((ci) => ({ label: ci.label.trim(), amount: num(ci.amount) }))
    : [];
  const itemsTotal = costItems.reduce((s, ci) => s + ci.amount, 0);

  return {
    size: String(v.size ?? "").trim(),
    price: num(v.price),
    mrp: num(v.mrp),
    stock: Math.floor(num(v.stock)),
    oil_cost: num(v.oil_cost),
    packaging_cost: num(v.packaging_cost),
    other_cost: num(v.other_cost),
    // Cost items supplied → their sum is the total (even ₹0); otherwise keep the old fallbacks
    total_cost: costItems.length
      ? itemsTotal
      : num(v.total_cost) || num(v.oil_cost) + num(v.packaging_cost) + num(v.other_cost),
    cost_items: costItems,
  };
}
