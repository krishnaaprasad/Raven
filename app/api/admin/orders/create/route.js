import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const {
      userName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      productName,
      quantity,
      price,
      shippingCharge,
    } = body;

    // 🛑 BASIC VALIDATION (only required fields)
    if (
      !userName ||
      !email ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !pincode ||
      !productName ||
      !quantity ||
      !price
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const qty = Number(quantity);
    const unitPrice = Number(price);
    const shipping = Number(shippingCharge || 0);

    const totalAmount = qty * unitPrice + shipping;
    // Generate Manual Order ID
    const manualId = `RVN-MAN-${Date.now().toString().slice(-6)}`;

    const order = await Order.create({
      // 👤 CUSTOMER
      manualOrderId: manualId,
      userId: null,
      userName,
      email,
      phone,
      address,

      addressDetails: {
        address1: address,
        city,
        state,
        pincode,
      },

      // 🚚 REQUIRED BY MODEL
      deliveryType: "standard",

      // 🛒 SINGLE PRODUCT → CART FORMAT
      cartItems: [
        {
          name: productName,
          price: unitPrice,
          quantity: qty,
        },
      ],

      shippingCharge: shipping,
      totalAmount,

      // 💰 OFFLINE PAYMENT DEFAULTS
      payment_status: "PAID",
      status: "PAID",
      payment_state: "SUCCESS",

      // 📦 ORDER STATUS
      order_status: "Processing",
      verified: true,

      paymentGateway: "OFFLINE",
      paymentMethod: "OFFLINE",

      orderHistory: [
        {
          from: "N/A",
          to: "Processing",
          by: "admin",
          note: "Manual offline order created from admin panel",
        },
      ],
    });

    return NextResponse.json({ success: true, order });
  } catch (e) {
    console.error("❌ Manual order create error:", e);
    return NextResponse.json(
      { success: false, error: e.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
