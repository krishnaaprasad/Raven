// models/OtpRequest.js
// One row per OTP SMS sent — used to rate-limit sends (SMS credits cost money).
import mongoose from "mongoose";

const OtpRequestSchema = new mongoose.Schema({
  phone: { type: String, required: true, index: true },
  ip: { type: String, default: "", index: true },
  // TTL: rows delete themselves after 1 hour (longest window we check)
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 },
});

export default mongoose.models.OtpRequest || mongoose.model("OtpRequest", OtpRequestSchema);
