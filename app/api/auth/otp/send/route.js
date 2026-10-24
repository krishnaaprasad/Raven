import { sendOtp, isValidPhone } from "@/lib/otp";
import connectToDatabase from "@/lib/mongodb";
import OtpRequest from "@/models/OtpRequest";

// Limits (each OTP is a paid SMS)
const PER_PHONE_LIMIT = 3; // per 10 minutes
const PER_PHONE_WINDOW_MS = 10 * 60 * 1000;
const PER_IP_LIMIT = 10; // per hour
const PER_IP_WINDOW_MS = 60 * 60 * 1000;

function clientIp(req) {
  return (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "";
}

export async function POST(req) {
  try {
    const { phoneNumber } = await req.json();

    if (!isValidPhone(phoneNumber)) {
      return Response.json({ error: "Valid 10-digit phone number required" }, { status: 400 });
    }

    await connectToDatabase();
    const ip = clientIp(req);
    const now = Date.now();

    const [phoneCount, ipCount] = await Promise.all([
      OtpRequest.countDocuments({ phone: phoneNumber, createdAt: { $gte: new Date(now - PER_PHONE_WINDOW_MS) } }),
      ip
        ? OtpRequest.countDocuments({ ip, createdAt: { $gte: new Date(now - PER_IP_WINDOW_MS) } })
        : Promise.resolve(0),
    ]);

    if (phoneCount >= PER_PHONE_LIMIT || ipCount >= PER_IP_LIMIT) {
      return Response.json(
        { error: "Too many OTP requests. Please wait a few minutes and try again." },
        { status: 429 }
      );
    }

    // Record before sending so parallel requests can't all slip under the limit
    const entry = await OtpRequest.create({ phone: phoneNumber, ip });

    const result = await sendOtp(phoneNumber);
    if (!result.ok) {
      // A failed send shouldn't use up the customer's attempts
      await OtpRequest.deleteOne({ _id: entry._id }).catch(() => {});
      return Response.json({ error: result.error }, { status: result.status });
    }

    return Response.json({ success: true, verificationId: result.verificationId });
  } catch (error) {
    console.error("OTP Send Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
