import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order, OrderCounter } from "@/models/Order";
import Product from "@/models/Product"; // ✅ ADD
import { generateSequentialOrderIdFromItems } from "@/lib/generateOrderId";


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
  remark,
  discount,
  couponCode,
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

const subTotal = qty * unitPrice;
const discountAmount = Number(discount || 0);

if (discountAmount > subTotal) {
  return NextResponse.json(
    { success: false, error: "Discount cannot exceed subtotal" },
    { status: 400 }
  );
}

const totalAmount = subTotal + ship - discountAmount;



// ✅ Generate prefix from product (like production)
const now = new Date();
const datePart = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

let prefix =
  product.slug?.substring(0, 3).toUpperCase() ||
  product.name?.substring(0, 3).toUpperCase() ||
  "ORD";

const today = datePart;

// find by prefix+date
const customOrderId = await generateSequentialOrderIdFromItems([
  {
    slug: product.slug,
    name: product.name,
  },
]);

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

      // ✅ ADD THESE
      discount: discountAmount,
      couponCode: couponCode || null,

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
          note: remark || "Manual order entry",
          changes: [
            {
              field: "Discount",
              from: "--",
              to: discountAmount,
            },
            {
              field: "Coupon Code",
              from: "--",
              to: couponCode || "--",
            },
          ],
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
