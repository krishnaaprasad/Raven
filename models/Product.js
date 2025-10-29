import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    brand: { type: String },
    name: { type: String, required: true },
    description: { type: String },
    images: [
      {
        original: String,
        thumbnail: String,
      },
    ],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    benefits: [String],
    variants: [
      {
        size: String,
        price: Number,
      },
    ],
  },
  { timestamps: true }
);

// ✅ Avoid model overwrite errors
export default mongoose.models?.Product || mongoose.model("Product", ProductSchema);
