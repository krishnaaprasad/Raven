import mongoose from "mongoose";

const BulkPaymentSchema = new mongoose.Schema(
  {
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "BulkInvoice", required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "BulkClient", required: true },
    amount: { type: Number, required: true, min: 0.01 },
    paymentDate: { type: Date, required: true, default: Date.now },
    paymentMode: {
      type: String,
      enum: ["Cash", "UPI", "Bank Transfer", "Cheque"],
      default: "UPI",
    },
    reference: { type: String, default: "" },
    notes: { type: String, default: "" },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

BulkPaymentSchema.index({ invoiceId: 1, paymentDate: -1 });
BulkPaymentSchema.index({ clientId: 1, paymentDate: -1 });

const BulkPayment =
  mongoose.models.BulkPayment || mongoose.model("BulkPayment", BulkPaymentSchema);

export default BulkPayment;
