import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: String,
    slug: String,
    image: String,
    size: String,
    price: Number,
    quantity: Number,
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    sessionId: { type: String, index: true }, // for guest user cart reference
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    items: [cartItemSchema],
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent model overwrite
export default mongoose.models.Cart || mongoose.model("Cart", cartSchema);
