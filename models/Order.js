import mongoose from "mongoose";

// ========================
// 🧩 ORDER SCHEMA
// ========================
const orderSchema = new mongoose.Schema(
  {
    customOrderId: { type: String, unique: true },
    userName: { type: String, required: [true, "User name is required"] },
    email: { type: String, required: [true, "Email is required"] },
    phone: { type: String, required: [true, "Phone number is required"] },
    address: { type: String, required: [true, "Address is required"] },
    addressDetails: {
      address1: { type: String },
      address2: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },
    deliveryType: {
      type: String,
      enum: ["standard", "express", "pickup"],
      required: [true, "Delivery type is required"],
    },
    cartItems: [
      {
        name: { type: String, required: true },
        size: { type: String },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String },
        slug: { type: String },
      },
    ],
    shippingCharge: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "CANCELLED"],
      default: "PENDING",
    },
    paymentGateway: { type: String, default: "Cashfree" },
    paymentMethod: { type: mongoose.Schema.Types.Mixed, default: "Cashfree" }, // ✅ FIX: Allow object or string
    cf_order_id: { type: String, default: null },
    payment_session_id: { type: String, default: null },
    referenceId: { type: String, default: null },
    transactionDate: { type: Date },
    order_status: { type: String, default: "ACTIVE" },
    verified: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false }
  },
  { timestamps: true }
);

orderSchema.index({ email: 1, status: 1, createdAt: -1 });

// ========================
// 🧩 COUNTER SCHEMA
// ========================
const orderCounterSchema = new mongoose.Schema({
  prefix: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  seq: { type: Number, default: 1 },
});

// ========================
// ✅ EXPORT MODELS
// ========================
export const Order =
  mongoose.models.Order || mongoose.model("Order", orderSchema);

export const OrderCounter =
  mongoose.models.OrderCounter ||
  mongoose.model("OrderCounter", orderCounterSchema);
