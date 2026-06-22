import crypto from "crypto";

const DEFAULT_BASE_URL = "https://www.ravenfragrance.in";

// ─────────────────────────────────────────────────────────
// Template IDs (from Message Central / Meta approval)
// ─────────────────────────────────────────────────────────
export const WHATSAPP_TEMPLATES = {
  ORDER_CONFIRMATION: "order_confirmation",
  ORDER_DELIVERED: "order_delivered",
  REVIEW_REQUEST: "review_request_new",
  REPURCHASE_REMINDER: "repurchase_reminder",
};

export const WHATSAPP_TEMPLATE_IDS = {
  ORDER_DELIVERED: "4221641764765812",
  REVIEW_REQUEST: "1401016381860215",
};

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

export function getPublicBaseUrl() {
  return (process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
}

export function getProductionBaseUrl() {
  // Always use production URL for invoice/order links in WhatsApp messages
  return "https://www.ravenfragrance.in";
}

export function formatOrderDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date ? new Date(date) : new Date());
}

export function getOrderNumber(order) {
  return order?.customOrderId || order?._id?.toString();
}

export function getInvoiceToken(order) {
  const secret = process.env.NEXTAUTH_SECRET || process.env.MESSAGE_CENTRAL_AUTH_TOKEN;
  if (!secret || !String(secret).trim()) {
    throw new Error("Missing invoice signing secret: set NEXTAUTH_SECRET or MESSAGE_CENTRAL_AUTH_TOKEN");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(`${order._id}:${order.customOrderId || ""}:${order.totalAmount}`)
    .digest("hex");
}

export function verifyInvoiceToken(order, token) {
  if (!token) return false;
  const expected = getInvoiceToken(order);
  const received = Buffer.from(String(token));
  const expectedBuffer = Buffer.from(expected);
  if (received.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, received);
}

export function buildInvoiceUrl(order) {
  const baseUrl = getProductionBaseUrl();
  return `${baseUrl}/api/invoice?orderId=${order._id}`;
}

export function buildOrderDetailsUrl(order) {
  return `${getProductionBaseUrl()}/my-account/order/${order._id}`;
}

export function buildProductUrl(item) {
  const slug = item?.slug || slugify(item?.name || "");
  const productSlug = slug || item?.id || item?.sku || item?._id || "product";
  return `${getProductionBaseUrl()}/product/${productSlug}`;
}

export function buildProductReviewUrl(item) {
  const slug = item?.slug || slugify(item?.name || "");
  const productSlug = slug || item?.id || item?.sku || item?._id || "product";
  return `${getProductionBaseUrl()}/product/${productSlug}?review=true#reviews-section`;
}

// ─────────────────────────────────────────────────────────
// ORDER DELIVERED payload
//
// Template: 4221641764765812
// Header: product image
// Body: {{1}} = customer name, {{2}} = orderId - product, {{3}} = amount
// CTA 1 (dynamic): invoice download URL
// CTA 2: static (no dynamic param)
// ─────────────────────────────────────────────────────────
export function getDeliveryPayload(order) {
  const orderNumber = getOrderNumber(order);
  const items = Array.isArray(order.cartItems) ? order.cartItems : [];
  const firstItem = items[0];

  // Format: "LUC20260614001 - Lucifer"
  const productNames = items.map((i) => i.name).join(", ");
  const orderWithProduct = `${orderNumber} - ${productNames}`;

  // Product image for header
  const headerImage = firstItem?.image || "";

  // Invoice URL for CTA button 1
  const invoiceUrl = buildInvoiceUrl(order);

  return {
    templateId: WHATSAPP_TEMPLATE_IDS.ORDER_DELIVERED,
    templateName: WHATSAPP_TEMPLATES.ORDER_DELIVERED,
    headerImageUrl: headerImage,
    bodyVariables: {
      body_1: order.userName || "Customer",
      body_2: orderWithProduct,
      body_3: String(order.totalAmount || 0),
    },
    ctaVariables: [invoiceUrl], // CTA 1 = dynamic invoice URL
  };
}

// ─────────────────────────────────────────────────────────
// ORDER CONFIRMATION payload (placeholder — update when template approved)
// ─────────────────────────────────────────────────────────
export function getOrderConfirmationPayload(order) {
  return {
    templateId: "", // Not yet approved / integrated
    templateName: WHATSAPP_TEMPLATES.ORDER_CONFIRMATION,
    bodyVariables: {
      body_1: order.userName || "Customer",
      body_2: getOrderNumber(order),
      body_3: String(order.totalAmount || 0),
      body_4: formatOrderDate(order.transactionDate || order.createdAt),
    },
    ctaVariables: [buildInvoiceUrl(order), buildOrderDetailsUrl(order)],
  };
}

// ─────────────────────────────────────────────────────────
// REVIEW REQUEST payload (to be configured next)
// Template: 1401016381860215
// ─────────────────────────────────────────────────────────
export function getReviewPayload(order, item) {
  return {
    templateId: WHATSAPP_TEMPLATE_IDS.REVIEW_REQUEST,
    templateName: WHATSAPP_TEMPLATES.REVIEW_REQUEST,
    bodyVariables: {
      body_1: order.userName || "Customer",
      body_2: item.name || "your purchase",
    },
    ctaVariables: [buildProductReviewUrl(item)],
  };
}

// ─────────────────────────────────────────────────────────
// REPURCHASE REMINDER payload (placeholder)
// ─────────────────────────────────────────────────────────
export function getRepurchasePayload(order, item) {
  return {
    templateId: "",
    templateName: WHATSAPP_TEMPLATES.REPURCHASE_REMINDER,
    bodyVariables: {
      body_1: order.userName || "Customer",
      body_2: item.name || "your fragrance",
    },
    ctaVariables: [buildProductUrl(item)],
  };
}

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
