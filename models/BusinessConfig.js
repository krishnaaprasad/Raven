import mongoose from "mongoose";

const BusinessConfigSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

const BusinessConfig =
  mongoose.models.BusinessConfig ||
  mongoose.model("BusinessConfig", BusinessConfigSchema);

export default BusinessConfig;
