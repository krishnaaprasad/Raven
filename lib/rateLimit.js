// Simple MongoDB-backed rate limit for public forms (serverless-safe: no in-memory state).
import RateLimitHit from "@/models/RateLimitHit";

export function clientIp(req) {
  return (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

/**
 * Records a hit and reports whether it is within the limit.
 * @param {string} key   e.g. "contact:1.2.3.4"
 * @param {number} limit max hits allowed in the window
 * @param {number} windowMs window length (≤ 24h, the TTL)
 */
export async function allowRequest(key, limit, windowMs) {
  const since = new Date(Date.now() - windowMs);
  const count = await RateLimitHit.countDocuments({ key, createdAt: { $gte: since } });
  if (count >= limit) return false;
  await RateLimitHit.create({ key });
  return true;
}

export const tooManyRequests = () =>
  Response.json(
    { success: false, message: "Too many requests. Please try again later.", error: "Too many requests. Please try again later." },
    { status: 429 }
  );
