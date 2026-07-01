import mongoose from "mongoose";

const BulkClientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, default: "" },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    gst: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    creditLimit: { type: Number, default: 0, min: 0 },
    notes: { type: String, default: "" },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

BulkClientSchema.index({ name: 1 });
BulkClientSchema.index({ deleted: 1 });

const BulkClient =
  mongoose.models.BulkClient || mongoose.model("BulkClient", BulkClientSchema);

export default BulkClient;
