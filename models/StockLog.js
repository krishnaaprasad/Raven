import mongoose from "mongoose";

const stockLogSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantSize: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "ORDER_PLACED",
        "ORDER_CANCELLED",
        "MANUAL_ADJUST",
        "RESTOCK",
        "DAMAGE",
        "RETURN",
        "CORRECTION",
      ],
      required: true,
    },
    quantity: { type: Number, required: true }, // positive for additions, negative for deductions
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    reason: { type: String, default: null },
    by: { type: String, default: "system" }, // "system" or admin name
  },
  { timestamps: true }
);

stockLogSchema.index({ productId: 1, createdAt: -1 });
stockLogSchema.index({ orderId: 1 });

const StockLog =
  mongoose.models.StockLog || mongoose.model("StockLog", stockLogSchema);

export default StockLog;
