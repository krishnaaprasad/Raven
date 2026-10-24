// Server-only helpers for MessageCentral OTP. The auth token never leaves the server.

function getCreds() {
  const customerId =
    process.env.MESSAGE_CENTRAL_CUSTOMER_ID || process.env.MESSAGECENTRAL_CUSTOMER_ID;
  const authToken =
    process.env.MESSAGE_CENTRAL_AUTH_TOKEN || process.env.MESSAGECENTRAL_AUTH_TOKEN;
  return { customerId, authToken };
}

export function isValidPhone(phone) {
  return typeof phone === "string" && /^\d{10}$/.test(phone);
}

export async function sendOtp(phone) {
  const { customerId, authToken } = getCreds();
  if (!customerId || !authToken) {
    return { ok: false, status: 500, error: "SMS service not configured" };
  }

  const params = new URLSearchParams({
    countryCode: "91",
    customerId,
    flowType: "SMS",
    mobileNumber: phone,
  });
  const res = await fetch(
    `https://cpaas.messagecentral.com/verification/v3/send?${params}`,
    { method: "POST", headers: { authToken } }
  );
  const data = await res.json();

  if (data.responseCode === 200) {
    return { ok: true, verificationId: String(data.data.verificationId) };
  }
  console.error("OTP Send Failed:", data);
  return { ok: false, status: 400, error: data.message || "Failed to send OTP" };
}

export async function validateOtp(phone, verificationId, code) {
  const { customerId, authToken } = getCreds();
  if (!customerId || !authToken) {
    return { ok: false, error: "SMS service not configured" };
  }
  if (!isValidPhone(phone) || !/^\d{4,6}$/.test(String(code || "")) || !verificationId) {
    return { ok: false, error: "Invalid OTP" };
  }

  const params = new URLSearchParams({
    countryCode: "91",
    mobileNumber: phone,
    verificationId: String(verificationId),
    customerId,
    code: String(code),
  });
  const res = await fetch(
    `https://cpaas.messagecentral.com/verification/v3/validateOtp?${params}`,
    { method: "GET", headers: { authToken } }
  );
  const data = await res.json();

  if (data.responseCode === 200) return { ok: true };

  let error = "Invalid OTP";
  if (data.responseCode === 702) error = "Wrong OTP provided";
  if (data.responseCode === 705) error = "OTP has expired";
  if (data.responseCode === 703) error = "Already verified";
  return { ok: false, error };
}
