// /models/Order.js
import mongoose from "mongoose";

const orderHistoryItem = new mongoose.Schema(
  {
    from: { type: String },
    to: { type: String },
    by: { type: String }, // 'admin' or 'system'
    at: { type: Date, default: Date.now },
    note: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customOrderId: { type: String, unique: true, sparse: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // optional link to user
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

    // ---------- Payment raw from gateway ----------
    payment_state: {
      type: String,
      enum: [
        "NOT_ATTEMPTED",
        "PENDING",
        "SUCCESS",
        "FAILED",
        "FLAGGED",
        "CANCELLED",
        "VOID",
        "USER_DROPPED",
      ],
      default: "NOT_ATTEMPTED",
    },

    // ---------- Business payment status (derived) ----------
    payment_status: {
      type: String,
      enum: ["PAID", "PENDING", "FAILED", "CANCELLED"],
      default: "PENDING",
    },

    // ---------- Order workflow status (admin editable) ----------
    order_status: {
      type: String,
      enum: [
        "Payment Awaiting",
        "Processing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Payment Awaiting",
    },

    // Backwards-compatible legacy field (sync'd to payment_status)
    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "CANCELLED"],
      default: "PENDING",
    },

    paymentGateway: { type: String, default: "Cashfree" },
    paymentMethod: { type: mongoose.Schema.Types.Mixed, default: "Cashfree" },
    paymentDetails: { type: mongoose.Schema.Types.Mixed, default: {} },

    cf_order_id: { type: String, default: null },
    payment_session_id: { type: String, default: null },
    referenceId: { type: String, default: null },
    transactionDate: { type: Date },

    verified: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },

    orderHistory: {
      type: [orderHistoryItem],
      default: [],
    },
  },
  { timestamps: true }
);

orderSchema.index({ email: 1, payment_status: 1, createdAt: -1 });

export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

// Counter for generating incremental Raven Order IDs (e.g., RVN-20250124-0001)
const orderCounterSchema = new mongoose.Schema({
  prefix: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  seq: { type: Number, default: 1 },
});

export const OrderCounter =
  mongoose.models.OrderCounter ||
  mongoose.model("OrderCounter", orderCounterSchema);

