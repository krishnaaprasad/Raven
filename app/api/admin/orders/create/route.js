import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order, OrderCounter } from "@/models/Order";
import Product from "@/models/Product"; // ✅ ADD

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
  productId,
  variantSize,          // ✅ NEW
  quantity,
  shippingCharge,
  paymentMethod,
  orderDate,
  price,
} = body;

if (!userName || !phone || !productId || !variantSize) {
  return NextResponse.json(
    { success: false, error: "Missing required fields" },
    { status: 400 }
  );
}

const product = await Product.findById(productId);
if (!product) {
  return NextResponse.json(
    { success: false, error: "Product not found" },
    { status: 404 }
  );
}

const variant = product.variants.find(
  (v) => String(v.size) === String(variantSize)
);

if (!variant || variant.price == null) {
  return NextResponse.json(
    { success: false, error: "Invalid product variant selected" },
    { status: 400 }
  );
}

const qty = Math.max(1, Number(quantity || 1));
const ship = Number(shippingCharge || 0);
const unitPrice =
  price != null && price !== ""
    ? Number(price)
    : Number(variant.price);


if (Number.isNaN(unitPrice)) {
  return NextResponse.json(
    { success: false, error: "Invalid variant price" },
    { status: 400 }
  );
}

const totalAmount = qty * unitPrice + ship;



    // ✅ MANUAL ORDER ID
    const today = new Date().toISOString().slice(0, 10);
    const counter = await OrderCounter.findOneAndUpdate(
      { prefix: "MAN", date: today },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );

    const customOrderId = `MAN-${String(counter.seq).padStart(5, "0")}`;

    // ✅ CREATE ORDER
    const order = await Order.create({
      customOrderId,

      userId: null,
      userName,
      email: email || "",
      phone,
      address,
      addressDetails: {
        address1: address,
        city,
        state,
        pincode,
      },

      deliveryType: "standard",

      cartItems: [
        {
          name: product.name,
          size: variant.size,
          price: Number(unitPrice),   // ⬅ ENSURE NUMBER
          quantity: qty,
          image: product.images?.[0] || "",
          slug: product.slug,
        },
      ],


      shippingCharge: ship,
      totalAmount,

      payment_status: "PAID",
      status: "PAID",
      order_status: "Processing",

      paymentGateway: "Manual",
      paymentMethod: paymentMethod || "Cash",

      createdAt: orderDate ? new Date(orderDate) : new Date(), // ✅ IMPORTANT

      orderHistory: [
        {
          from: "Created",
          to: "Processing",
          by: "admin",
          note: "Manual order entry",
        },
      ],
    });

    return NextResponse.json({ success: true, order });
  } catch (e) {
    console.error("❌ CREATE MANUAL ORDER ERROR:", e);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
