import axios from "axios";
import { Order } from "@/models/Order";
import {
  getDeliveryPayload,
  getOrderConfirmationPayload,
  getRepurchasePayload,
  getReviewPayload,
} from "./templates.service";

const MESSAGE_CENTRAL_BASE_URL = "https://cpaas.messagecentral.com";
const DEFAULT_COUNTRY_CODE = "91";
const DEFAULT_LANG_ID = "en_US";
const MAX_RETRIES = 2;

let cachedToken = null;
let cachedTokenExpiry = 0;

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

async function getAuthToken() {
  if (process.env.MESSAGE_CENTRAL_AUTH_TOKEN) return process.env.MESSAGE_CENTRAL_AUTH_TOKEN;

  const now = Date.now();
  if (cachedToken && cachedTokenExpiry > now) return cachedToken;

  cachedToken = null;
  cachedTokenExpiry = 0;

  const customerId = process.env.MESSAGE_CENTRAL_CUSTOMER_ID;
  const key = process.env.MESSAGE_CENTRAL_API_KEY;

  if (!customerId || !key) {
    throw new Error("Message Central customer id/api key missing");
  }

  const response = await axios.get(`${MESSAGE_CENTRAL_BASE_URL}/auth/v1/authentication/token`, {
    params: {
      customerId,
      key,
      scope: "NEW",
      country: process.env.MESSAGE_CENTRAL_COUNTRY_CODE || DEFAULT_COUNTRY_CODE,
    },
    headers: { accept: "*/*" },
  });

  cachedToken = response.data?.token;
  const expiresIn = Number(response.data?.expires_in || response.data?.expiresIn || 0);
  cachedTokenExpiry = expiresIn > 0 ? Date.now() + expiresIn * 1000 : Date.now() + 50 * 60 * 1000;

  if (!cachedToken) throw new Error("Message Central token response missing token");
  return cachedToken;
}

async function sendTemplateRequest({ phone, templateName, variables = [], ctaVariables = [], retry = false }) {
  const senderId = process.env.MESSAGE_CENTRAL_SENDER_ID;
  if (!senderId) throw new Error("MESSAGE_CENTRAL_SENDER_ID is required for WhatsApp sends");

  const token = await getAuthToken();
  const countryCode = process.env.MESSAGE_CENTRAL_COUNTRY_CODE || DEFAULT_COUNTRY_CODE;
  const langId = process.env.MESSAGE_CENTRAL_LANG_ID || DEFAULT_LANG_ID;

  try {
    return await axios.post(`${MESSAGE_CENTRAL_BASE_URL}/verification/v3/send`, null, {
    params: {
      flowType: "WHATSAPP",
      type: "BROADCAST",
      mobileNumber: phone,
      countryCode,
      senderId,
      langId,
      templateName,
      variables: variables.filter(Boolean).join(", "),
      ctaVariables: ctaVariables.filter(Boolean).join(", "),
    },
      headers: { authToken: token },
      timeout: 15000,
    });
  } catch (error) {
    if (!retry && (error.response?.status === 401 || error.response?.status === 403)) {
      cachedToken = null;
      cachedTokenExpiry = 0;
      return sendTemplateRequest({ phone, templateName, variables, ctaVariables, retry: true });
    }
    throw error;
  }
}

export async function sendWhatsAppTemplate({ order, phone, templateName, variables, ctaVariables }) {
  const normalizedPhone = normalizeIndianMobile(phone || order?.phone);

  if (!normalizedPhone) {
    const response = { message: "Invalid mobile number" };
    await appendWhatsappLog(order?._id, { templateName, status: "skipped", phone, response });
    return { ok: false, skipped: true, response };
  }

  if (!isEnabled()) {
    const response = { message: "WHATSAPP_ENABLED=false; message logged only", variables, ctaVariables };
    console.log("WhatsApp log-only:", { phone: normalizedPhone, templateName, variables, ctaVariables });
    await appendWhatsappLog(order?._id, { templateName, status: "logged", phone: normalizedPhone, response });
    return { ok: true, loggedOnly: true, response };
  }

  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt += 1) {
    try {
      const apiResponse = await sendTemplateRequest({
        phone: normalizedPhone,
        templateName,
        variables,
        ctaVariables,
      });

      const response = apiResponse.data;
      await appendWhatsappLog(order?._id, { templateName, status: "sent", phone: normalizedPhone, response });
      return { ok: true, response };
    } catch (error) {
      lastError = error;
      const response = error.response?.data || { message: error.message, attempt };
      await appendWhatsappLog(order?._id, { templateName, status: "failed", phone: normalizedPhone, response });
      if (attempt <= MAX_RETRIES) await delay(attempt * 1000);
    }
  }

  return { ok: false, response: lastError?.response?.data || { message: lastError?.message } };
}

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
  if (results.length && results.every((result) => result.ok)) {
    await Order.findByIdAndUpdate(order._id, { reviewRequestSent: true });
  }
  return { ok: results.every((result) => result.ok), results };
}

export async function sendRepurchaseReminder(order) {
  if (!order || order.repurchaseReminderSent) return { ok: true, skipped: true };
  const items = Array.isArray(order.cartItems) ? order.cartItems : [];
  const results = [];
  for (const item of items) {
    results.push(await sendWhatsAppTemplate({ order, phone: order.phone, ...getRepurchasePayload(order, item) }));
  }
  if (results.length && results.every((result) => result.ok)) {
    await Order.findByIdAndUpdate(order._id, { repurchaseReminderSent: true });
  }
  return { ok: results.every((result) => result.ok), results };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
