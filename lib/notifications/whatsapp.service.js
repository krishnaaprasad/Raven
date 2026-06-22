import axios from "axios";
import FormData from "form-data";
import { Order } from "@/models/Order";
import {
  getDeliveryPayload,
  getOrderConfirmationPayload,
  getRepurchasePayload,
  getReviewPayload,
} from "./templates.service";

// ─────────────────────────────────────────────────────────
// Message Central "WhatsApp Now" API
// Docs: https://whatsapp.messagecentral.com
// ─────────────────────────────────────────────────────────
const WHATSAPP_API_BASE = "https://whatsapp.messagecentral.com/whatsapp/api/v1";
const DEFAULT_COUNTRY_CODE = "91";
const MAX_RETRIES = 2;

function isEnabled() {
  return String(process.env.WHATSAPP_ENABLED).toLowerCase() === "true";
}

export function normalizeIndianMobile(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  const withoutPrefix = digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;
  if (!/^[6-9]\d{9}$/.test(withoutPrefix)) return null;
  return withoutPrefix;
}

async function appendWhatsappLog(orderId, log) {
  if (!orderId) return;
  try {
    await Order.findByIdAndUpdate(orderId, {
      $push: {
        whatsappLogs: {
          timestamp: new Date(),
          ...log,
        },
      },
    });
  } catch (error) {
    console.error("WhatsApp log write failed:", error.message);
  }
}

// ─────────────────────────────────────────────────────────
// Core API call — Message Central WhatsApp Now
// Uses multipart/form-data as per their API spec
// ─────────────────────────────────────────────────────────
async function sendTemplateRequest({
  phone,
  templateId,
  templateName,
  bodyVariables = {},
  headerImageUrl = null,
  ctaVariables = [],
}) {
  const projectId = process.env.MESSAGE_CENTRAL_PROJECT_ID;
  const apiKey = process.env.MESSAGE_CENTRAL_WA_API_KEY;

  if (!projectId) throw new Error("MESSAGE_CENTRAL_PROJECT_ID is required");
  if (!apiKey) throw new Error("MESSAGE_CENTRAL_WA_API_KEY is required");

  const form = new FormData();
  form.append("template_id", templateId);
  form.append("country_code", DEFAULT_COUNTRY_CODE);
  form.append("phone_number", phone);

  // Body variables: body_1, body_2, body_3, etc.
  for (const [key, value] of Object.entries(bodyVariables)) {
    if (value != null && value !== "") {
      form.append(key, String(value));
    }
  }

  // Header image (if template has header media)
  if (headerImageUrl) {
    form.append("header_image", headerImageUrl);
  }

  // CTA dynamic URL variables: cta_body_1, cta_body_2, etc.
  if (ctaVariables.length > 0) {
    ctaVariables.forEach((url, idx) => {
      if (url) {
        form.append(`cta_body_${idx + 1}`, String(url));
      }
    });
  }

  const response = await axios.post(
    `${WHATSAPP_API_BASE}/broadcasts/single`,
    form,
    {
      headers: {
        "X-Project-Id": projectId,
        "x-api-key": apiKey,
        ...form.getHeaders(),
      },
      timeout: 15000,
    }
  );

  return response;
}

// ─────────────────────────────────────────────────────────
// Public send function — handles logging, retries, disable flag
// ─────────────────────────────────────────────────────────
export async function sendWhatsAppTemplate({
  order,
  phone,
  templateId,
  templateName,
  bodyVariables = {},
  headerImageUrl = null,
  ctaVariables = [],
  // Legacy support: accept 'variables' array and convert to bodyVariables
  variables,
}) {
  const normalizedPhone = normalizeIndianMobile(phone || order?.phone);

  if (!normalizedPhone) {
    const response = { message: "Invalid mobile number" };
    await appendWhatsappLog(order?._id, { templateName, status: "skipped", phone, response });
    return { ok: false, skipped: true, response };
  }

  if (!isEnabled()) {
    const response = {
      message: "WHATSAPP_ENABLED=false; message logged only",
      templateId,
      templateName,
      bodyVariables,
      ctaVariables,
    };
    console.log("📱 WhatsApp log-only:", { phone: normalizedPhone, templateName, templateId, bodyVariables, ctaVariables });
    await appendWhatsappLog(order?._id, { templateName, status: "logged", phone: normalizedPhone, response });
    return { ok: true, loggedOnly: true, response };
  }

  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt += 1) {
    try {
      const apiResponse = await sendTemplateRequest({
        phone: normalizedPhone,
        templateId,
        templateName,
        bodyVariables,
        headerImageUrl,
        ctaVariables,
      });

      const response = apiResponse.data;
      await appendWhatsappLog(order?._id, { templateName, status: "sent", phone: normalizedPhone, response });
      return { ok: true, response };
    } catch (error) {
      lastError = error;
      const response = error.response?.data || { message: error.message, attempt };
      await appendWhatsappLog(order?._id, { templateName, status: "failed", phone: normalizedPhone, response });

      if (attempt <= MAX_RETRIES) {
        await delay(attempt * 1000);
      }
    }
  }

  return { ok: false, response: lastError?.response?.data || { message: lastError?.message } };
}

// ─────────────────────────────────────────────────────────
// High-level send functions (called from webhook, admin, cron)
// ─────────────────────────────────────────────────────────

export async function sendOrderConfirmation(order) {
  if (!order || order.orderConfirmationSent) return { ok: true, skipped: true };
  const payload = getOrderConfirmationPayload(order);
  const result = await sendWhatsAppTemplate({ order, phone: order.phone, ...payload });
  if (result.ok) {
    await Order.findByIdAndUpdate(order._id, { orderConfirmationSent: true });
  }
  return result;
}

export async function sendDeliveryMessage(order) {
  if (!order || order.deliveryMessageSent || order.deliveredWhatsappSent) return { ok: true, skipped: true };
  const payload = getDeliveryPayload(order);
  const result = await sendWhatsAppTemplate({ order, phone: order.phone, ...payload });
  if (result.ok) {
    await Order.findByIdAndUpdate(order._id, {
      deliveryMessageSent: true,
      deliveredWhatsappSent: true,
      deliveredAt: order.deliveredAt || new Date(),
    });
  }
  return result;
}

export async function sendReviewRequest(order) {
  if (!order || order.reviewRequestSent) return { ok: true, skipped: true };
  const items = Array.isArray(order.cartItems) ? order.cartItems : [];
  const results = [];
  for (const item of items) {
    results.push(await sendWhatsAppTemplate({ order, phone: order.phone, ...getReviewPayload(order, item) }));
  }
  if (results.length && results.every((r) => r.ok)) {
    await Order.findByIdAndUpdate(order._id, { reviewRequestSent: true });
  }
  return { ok: results.every((r) => r.ok), results };
}

export async function sendRepurchaseReminder(order) {
  if (!order || order.repurchaseReminderSent) return { ok: true, skipped: true };
  const items = Array.isArray(order.cartItems) ? order.cartItems : [];
  const results = [];
  for (const item of items) {
    results.push(await sendWhatsAppTemplate({ order, phone: order.phone, ...getRepurchasePayload(order, item) }));
  }
  if (results.length && results.every((r) => r.ok)) {
    await Order.findByIdAndUpdate(order._id, { repurchaseReminderSent: true });
  }
  return { ok: results.every((r) => r.ok), results };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
