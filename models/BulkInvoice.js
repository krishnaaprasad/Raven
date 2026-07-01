import mongoose from "mongoose";

const BulkInvoiceLineSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    variantSize: { type: String, required: true },
    sku: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    unitCost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

const BulkInvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "BulkClient", required: true },
    clientName: { type: String, required: true },

    invoiceDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date, required: true },

    lineItems: {
      type: [BulkInvoiceLineSchema],
      required: true,
      validate: [(v) => v.length > 0, "At least one line item required"],
    },

    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    totalDiscount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    totalCogs: { type: Number, default: 0 },
    grossProfit: { type: Number, default: 0 },

    amountPaid: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "received"],
      default: "pending",
    },

    stockDeducted: { type: Boolean, default: false },
    notes: { type: String, default: "" },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

BulkInvoiceSchema.index({ clientId: 1, invoiceDate: -1 });
BulkInvoiceSchema.index({ paymentStatus: 1, dueDate: 1 });
BulkInvoiceSchema.index({ deleted: 1, invoiceDate: -1 });

const BulkInvoice =
  mongoose.models.BulkInvoice || mongoose.model("BulkInvoice", BulkInvoiceSchema);

export default BulkInvoice;
