export async function POST(req) {
  try {
    const { verificationId, phoneNumber, otp, authToken } = await req.json();

    if (!verificationId || !otp || !authToken || !phoneNumber) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const customerId = process.env.MESSAGECENTRAL_CUSTOMER_ID;

    // Use GET method and add url search parameters
    const validateResponse = await fetch(`https://cpaas.messagecentral.com/verification/v3/validateOtp?countryCode=91&mobileNumber=${phoneNumber}&verificationId=${verificationId}&customerId=${customerId}&code=${otp}`, {
      method: 'GET',
      headers: {
        'authToken': authToken,
      }
    });

    const validateData = await validateResponse.json();

    if (validateData.responseCode === 200) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } else {
      console.error("OTP Validation Failed:", validateData);
      
      let errorMessage = "Invalid OTP";
      if (validateData.responseCode === 702) errorMessage = "Wrong OTP provided";
      if (validateData.responseCode === 705) errorMessage = "OTP has expired";
      if (validateData.responseCode === 703) errorMessage = "Already verified";

      return new Response(JSON.stringify({ error: errorMessage }), { status: 400 });
    }

  } catch (error) {
    console.error("OTP Validate Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
