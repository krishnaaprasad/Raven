import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order, OrderCounter } from "@/models/Order";
import axios from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// =============================
// Helper → Generate Sequential Custom Order ID
// =============================
async function generateSequentialOrderId(cartItems) {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

  let prefix = "ORD";
  if (cartItems?.length === 1) {
    const firstItem = cartItems[0];
    prefix =
      firstItem?.slug?.substring(0, 3).toUpperCase() ||
      firstItem?.name?.substring(0, 3).toUpperCase() ||
      "ORD";
  }

  const today = datePart;
  let counter = await OrderCounter.findOne({ prefix });

  if (!counter || counter.date !== today) {
    counter = await OrderCounter.findOneAndUpdate(
      { prefix },
      { date: today, seq: 1 },
      { upsert: true, new: true }
    );
  } else {
    counter = await OrderCounter.findOneAndUpdate(
      { prefix },
      { $inc: { seq: 1 } },
      { new: true }
    );
  }

  const sequence = String(counter.seq).padStart(3, "0");
  return `${prefix}${datePart}${sequence}`;
}

// =============================
// POST Handler
// =============================
export async function POST(req) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);

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

    // ✅ Generate custom order ID
    const customOrderId = await generateSequentialOrderId(cartItems);

    const fullAddress = `${address1}, ${address2 || ""}, ${city}, ${state}, ${pincode}`;
    const newOrder = await Order.create({
      customOrderId,
      userId: session?.user?.id || null,
      userName: `${firstName} ${lastName}`,
      email,
      phone,
      address: fullAddress,
      addressDetails: { address1, address2, city, state, pincode },
      deliveryType: shipping,
      cartItems: cartItems.map((item) => ({
        name: item.name,
        size: item.size,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        slug: item.slug,
      })),
      shippingCharge,
      totalAmount,
      status: "PENDING",
    });

    const isProduction = process.env.NEXT_PUBLIC_CASHFREE_ENV === "production";
    const baseURL = isProduction
      ? "https://api.cashfree.com/pg/orders"
      : "https://sandbox.cashfree.com/pg/orders";
    const frontendURL = isProduction
      ? "https://www.ravenfragrance.in"
      : "http://localhost:3000";

    const cashfreePayload = {
      order_id: customOrderId,
      order_amount: totalAmount,
      order_currency: "INR",
      customer_details: {
        customer_id: customOrderId,
        customer_name: `${firstName} ${lastName}`,
        customer_email: email,
        customer_phone: phone,
      },
      order_note: `Order placed on Raven Fragrance by ${firstName} ${lastName} (${customOrderId})`,
      order_tags: {
        brand: "Raven Fragrance",
        order_prefix: customOrderId.slice(0, 3),
      },
      order_meta: {
        return_url: `${frontendURL}/order-success?orderId=${newOrder._id}&cfOrderId=${customOrderId}`,
      },
    };

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
      await Order.findByIdAndUpdate(newOrder._id, {
        status: "FAILED",
        cashfreeResponse: cfData,
      });
      return NextResponse.json(
        { error: "Failed to initialize payment" },
        { status: 400 }
      );
    }

    await Order.findByIdAndUpdate(newOrder._id, {
      cf_order_id: cfData.cf_order_id,
      payment_session_id: cfData.payment_session_id,
      cashfreeResponse: cfData,
    });

    // ✅ Return customOrderId to frontend
    return NextResponse.json(
      {
        order_id: newOrder._id,
        custom_order_id: customOrderId,
        cf_order_id: cfData.cf_order_id,
        payment_session_id: cfData.payment_session_id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Payment create error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
