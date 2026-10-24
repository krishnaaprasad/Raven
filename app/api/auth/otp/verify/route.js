import { validateOtp } from "@/lib/otp";

// Used only for phone verification without login (e.g. changing phone number).
// Login verifies the OTP itself inside the NextAuth credentials provider.
export async function POST(req) {
  try {
    const { verificationId, phoneNumber, otp } = await req.json();

    if (!verificationId || !otp || !phoneNumber) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await validateOtp(phoneNumber, verificationId, otp);
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("OTP Validate Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
