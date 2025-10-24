import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
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
    cf_order_id: { type: String, default: null },
    payment_session_id: { type: String, default: null },
    referenceId: { type: String, default: null }, // Transaction reference ID
    transactionDate: { type: Date },
    order_status: { type: String, default: "ACTIVE" },
  },
  { timestamps: true }
);

orderSchema.index({ email: 1, status: 1, createdAt: -1 });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
