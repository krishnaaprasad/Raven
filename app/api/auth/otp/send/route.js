export async function POST(req) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      return new Response(JSON.stringify({ error: "Valid 10-digit phone number required" }), { status: 400 });
    }

    const customerId = process.env.MESSAGECENTRAL_CUSTOMER_ID;
    const authToken = process.env.MESSAGECENTRAL_AUTH_TOKEN;

    if (!customerId || !authToken) {
      console.error("MessageCentral credentials missing");
      return new Response(JSON.stringify({ error: "SMS service not configured" }), { status: 500 });
    }

    const sendResponse = await fetch(`https://cpaas.messagecentral.com/verification/v3/send?countryCode=91&customerId=${customerId}&flowType=SMS&mobileNumber=${phoneNumber}`, {
      method: 'POST',
      headers: {
        'authToken': authToken,
      }
    });

    const sendData = await sendResponse.json();

    if (sendData.responseCode === 200) {
      return new Response(JSON.stringify({ 
        success: true, 
        verificationId: sendData.data.verificationId,
        authToken: authToken
      }), { status: 200 });
    } else {
      console.error("OTP Send Failed:", sendData);
      return new Response(JSON.stringify({ error: sendData.message || "Failed to send OTP" }), { status: 400 });
    }

  } catch (error) {
    console.error("OTP Send Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
