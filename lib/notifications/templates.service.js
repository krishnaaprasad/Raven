import crypto from "crypto";

const DEFAULT_BASE_URL = "https://ravenfragrance.com";

export const WHATSAPP_TEMPLATES = {
  ORDER_CONFIRMATION: "order_confirmation",
  ORDER_DELIVERED: "order_delivered",
  REVIEW_REQUEST: "review_request",
  REPURCHASE_REMINDER: "repurchase_reminder",
};

export function getPublicBaseUrl() {
  return (process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
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
  const baseUrl = getPublicBaseUrl();
  const token = getInvoiceToken(order);
  return `${baseUrl}/api/invoice/secure?orderId=${order._id}&token=${token}`;
}

export function buildOrderDetailsUrl(order) {
  return `${getPublicBaseUrl()}/my-account/order/${order._id}`;
}

export function buildProductUrl(item) {
  const slug = item?.slug || slugify(item?.name || "");
  const productSlug = slug || item?.id || item?.sku || item?._id || "product";
  return `${getPublicBaseUrl()}/product/${productSlug}`;
}

export function buildProductReviewUrl(item) {
  const slug = item?.slug || slugify(item?.name || "");
  const productSlug = slug || item?.id || item?.sku || item?._id || "product";
  return `${getPublicBaseUrl()}/product/${productSlug}?review=true#reviews-section`;
}

export function getOrderConfirmationPayload(order) {
  return {
    templateName: WHATSAPP_TEMPLATES.ORDER_CONFIRMATION,
    variables: [
      order.userName,
      getOrderNumber(order),
      String(order.totalAmount),
      formatOrderDate(order.transactionDate || order.createdAt),
    ],
    ctaVariables: [buildInvoiceUrl(order), buildOrderDetailsUrl(order)],
  };
}

export function getDeliveryPayload(order) {
  return {
    templateName: WHATSAPP_TEMPLATES.ORDER_DELIVERED,
    variables: [order.userName, getOrderNumber(order)],
    ctaVariables: [],
  };
}

export function getReviewPayload(order, item) {
  return {
    templateName: WHATSAPP_TEMPLATES.REVIEW_REQUEST,
    variables: [order.userName, item.name, buildProductReviewUrl(item)],
    ctaVariables: [buildProductReviewUrl(item)],
  };
}

export function getRepurchasePayload(order, item) {
  return {
    templateName: WHATSAPP_TEMPLATES.REPURCHASE_REMINDER,
    variables: [order.userName, item.name, buildProductUrl(item)],
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
