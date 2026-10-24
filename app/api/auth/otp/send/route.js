import { sendOtp, isValidPhone } from "@/lib/otp";

export async function POST(req) {
  try {
    const { phoneNumber } = await req.json();

    if (!isValidPhone(phoneNumber)) {
      return Response.json({ error: "Valid 10-digit phone number required" }, { status: 400 });
    }

    const result = await sendOtp(phoneNumber);
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status });
    }

    return Response.json({ success: true, verificationId: result.verificationId });
  } catch (error) {
    console.error("OTP Send Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
