import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true }, // link order to user
    orderNumber: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    items: [
      {
        productId: { type: String },
        name: { type: String },
        quantity: { type: Number },
        price: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

// Prevent model overwrite issues in Next.js hot reload
const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;
