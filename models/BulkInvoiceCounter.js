import mongoose from "mongoose";

const BulkInvoiceCounterSchema = new mongoose.Schema({
  prefix: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

const BulkInvoiceCounter =
  mongoose.models.BulkInvoiceCounter ||
  mongoose.model("BulkInvoiceCounter", BulkInvoiceCounterSchema);

export default BulkInvoiceCounter;
