import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import axios from "axios";

export async function POST(req) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      address1,
      address2,
      city,
      state,
      pincode,
      shipping,
      shippingCharge,
      totalAmount,
      cartItems,
    } = body;

    // Step 1: Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !address1 ||
      !city ||
      !state ||
      !pincode ||
      !shipping ||
      !totalAmount
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Step 2: Create order in MongoDB
    const fullAddress = `${address1}, ${address2 || ""}, ${city}, ${state}, ${pincode}`;
    const newOrder = await Order.create({
      userName: `${firstName} ${lastName}`,
      email,
      phone,
      address: fullAddress,
      addressDetails: { address1, address2, city, state, pincode },
      deliveryType: shipping,
      cartItems,
      shippingCharge,
      totalAmount,
      status: "PENDING",
    });

    // Step 3: Determine Cashfree environment dynamically
    const isProduction = process.env.NEXT_PUBLIC_CASHFREE_ENV === "production";
    const baseURL = isProduction
      ? "https://api.cashfree.com/pg/orders"
      : "https://sandbox.cashfree.com/pg/orders";

    // ✅ Auto-pick correct frontend URL
    const frontendURL = isProduction
      ? "https://www.ravenfragrance.in"
      : "http://localhost:3000";

    // Step 4: Prepare Cashfree order payload
    const cashfreePayload = {
      order_id: newOrder._id.toString(),
      order_amount: totalAmount,
      order_currency: "INR",
      customer_details: {
        customer_id: newOrder._id.toString(),
        customer_name: `${firstName} ${lastName}`,
        customer_email: email,
        customer_phone: phone,
      },
      order_meta: {
        return_url: `${frontendURL}/order-success?orderId=${newOrder._id}&cfOrderId={order_id}`,
      },
    };

    // Step 5: Create Cashfree order
    const cfResponse = await axios.post(baseURL, cashfreePayload, {
      headers: {
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        "x-api-version": "2022-09-01",
        "Content-Type": "application/json",
      },
    });

    const cfData = cfResponse.data;

    if (!cfData.cf_order_id) {
      console.error("❌ Cashfree order creation failed:", cfData);

      // Log failure for audit
      await Order.findByIdAndUpdate(newOrder._id, {
        cashfreeResponse: cfData,
        status: "FAILED",
      });

      return NextResponse.json(
        { error: "Failed to initialize payment" },
        { status: 400 }
      );
    }

    // Step 6: Save Cashfree info in DB (✅ includes full response log)
    await Order.findByIdAndUpdate(newOrder._id, {
      cf_order_id: cfData.cf_order_id,
      payment_session_id: cfData.payment_session_id,
      cashfreeResponse: cfData, // ✅ store full Cashfree API response
    });

    // Step 7: Return payment session to frontend
    return NextResponse.json(
      {
        order_id: newOrder._id,
        cf_order_id: cfData.cf_order_id,
        payment_session_id: cfData.payment_session_id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Payment create error:", error.response?.data || error.message || error);

    // Log any exception into DB if order was created
    try {
      const body = await req.json();
      if (body?.email) {
        await Order.create({
          email: body.email,
          status: "ERROR",
          errorDetails: error.response?.data || error.message || "Unknown error",
        });
      }
    } catch (innerErr) {
      console.error("Error logging failure:", innerErr);
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
