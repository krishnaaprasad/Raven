// One filter for the admin orders list AND the CSV export, so the export always
// contains exactly the orders shown on screen.

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const isDay = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || "");

export function buildAdminOrderFilter(searchParams) {
  const q = (searchParams.get("q") || "").trim();
  const paymentStatus = searchParams.get("paymentStatus") || null;
  const orderStatus = searchParams.get("orderStatus") || null;
  const from = searchParams.get("from") || null;
  const to = searchParams.get("to") || null;
  const hasDiscount = searchParams.get("hasDiscount") || null;
  const productName = searchParams.get("productName") || null;
  const showDeleted = searchParams.get("deleted") === "true";

  const filter = showDeleted ? { deleted: true } : { deleted: { $ne: true } };
  const and = [];

  if (q) {
    const re = new RegExp(escapeRegex(q), "i");
    and.push({
      $or: [{ customOrderId: re }, { userName: re }, { email: re }, { phone: re }, { "cartItems.name": re }],
    });
  }

  if (paymentStatus) {
    and.push({ $or: [{ payment_status: paymentStatus }, { status: paymentStatus }] });
  }

  if (orderStatus) filter.order_status = orderStatus;

  // Dates are India days (the server runs in UTC, so plain "YYYY-MM-DD" was 5.5h off)
  if (isDay(from) || isDay(to)) {
    filter.createdAt = {};
    if (isDay(from)) filter.createdAt.$gte = new Date(`${from}T00:00:00+05:30`);
    if (isDay(to)) filter.createdAt.$lte = new Date(`${to}T23:59:59.999+05:30`);
  }

  if (productName) {
    filter["cartItems.name"] = new RegExp(escapeRegex(productName), "i");
  }

  if (hasDiscount === "yes") filter.discount = { $gt: 0 };
  if (hasDiscount === "no") {
    and.push({ $or: [{ discount: { $exists: false } }, { discount: 0 }, { discount: null }] });
  }

  if (and.length) filter.$and = and;
  return filter;
}
