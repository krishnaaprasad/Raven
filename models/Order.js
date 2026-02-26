// /models/Order.js
import mongoose from "mongoose";

const orderHistoryItem = new mongoose.Schema(
  {
    type: {
      type: String, // STATUS | EDIT | DELETE
      default: "STATUS",
    },

    from: { type: String },
    to: { type: String },

    by: { type: String }, // admin / system
    note: { type: String },

    at: { type: Date, default: Date.now },

    // ✅ THIS WAS MISSING
    changes: [
      {
        field: { type: String },
        from: mongoose.Schema.Types.Mixed,
        to: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  { _id: false }
);


const orderSchema = new mongoose.Schema(
  {
    manualOrderId: { type: String, default: null },
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

    // ---------- Coupon / Discount ----------
    discount: { type: Number, default: 0, min: [0, "Discount cannot be negative"] },    couponCode: { type: String, default: null },

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
    // ---------- Soft delete ----------
    deleted: { type: Boolean, default: false },
    deleteReason: { type: String, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

orderSchema.index({ email: 1, payment_status: 1, createdAt: -1 });

const Order =
  mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;         // default export
export { Order };   

// Counter for generating incremental Raven Order IDs (e.g., RVN-20250124-0001)
const orderCounterSchema = new mongoose.Schema({
  prefix: { type: String, required: true }, 
  date: { type: String, required: true },
  seq: { type: Number, default: 1 },
});

// ✅ Only this compound index
orderCounterSchema.index({ prefix: 1, date: 1 }, { unique: true });

export const OrderCounter =
  mongoose.models.OrderCounter ||
  mongoose.model("OrderCounter", orderCounterSchema);


