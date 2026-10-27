// models/RateLimitHit.js
// One row per request for rate-limited public endpoints (contact, newsletter, reviews).
import mongoose from "mongoose";

const RateLimitHitSchema = new mongoose.Schema({
  key: { type: String, required: true, index: true },
  // TTL: rows delete themselves after 24 hours (longest window we check)
  createdAt: { type: Date, default: Date.now, expires: 24 * 60 * 60 },
});

export default mongoose.models.RateLimitHit || mongoose.model("RateLimitHit", RateLimitHitSchema);
