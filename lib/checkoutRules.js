// Shared by the checkout page and the create-order API so the price shown always matches the price charged.

export const SHIPPING_CHARGES = { standard: 50, express: 120, pickup: 0 };

// Matches the "FREE SHIPPING ON ORDERS ABOVE ₹1499" promise in the marquee
export const FREE_SHIPPING_MIN = 1499;

// Delivery areas: Mumbai region + Sangli
//   400 Mumbai, Thane, Navi Mumbai · 401 Mira-Bhayandar, Vasai, Virar
//   410 Panvel, Kharghar, Kamothe · 421 Kalyan, Dombivli, Ulhasnagar, Ambernath, Badlapur, Bhiwandi
//   416 Sangli
export const ALLOWED_PINCODE_PREFIXES = ["400", "401", "410", "421", "416"];

// One message for checkout page + API
export const DELIVERY_AREA_MESSAGE =
  "We currently deliver in Mumbai & nearby (Thane, Navi Mumbai, Mira-Bhayandar, Vasai-Virar, Kalyan-Dombivli, Panvel) and Sangli. We will soon start service in your area — stay tuned!";

export function isValidPincodeRegion(pincode) {
  return (
    typeof pincode === "string" &&
    /^\d{6}$/.test(pincode) &&
    ALLOWED_PINCODE_PREFIXES.some((prefix) => pincode.startsWith(prefix))
  );
}

// Standard shipping is free above FREE_SHIPPING_MIN; express is a paid upgrade
export function getShippingCharge(method, subtotal) {
  // Own-property check: `in` also matches inherited names like "toString"
  if (typeof method !== "string" || !Object.hasOwn(SHIPPING_CHARGES, method)) return null;
  if (method === "standard" && subtotal >= FREE_SHIPPING_MIN) return 0;
  return SHIPPING_CHARGES[method];
}
