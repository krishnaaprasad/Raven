// models/Product.js
import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  stock: { type: Number, default: 0 },
});

// ⭐ UPDATED PRODUCT MODEL
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

    benefits: [String],

    variants: [VariantSchema],

    fragranceType: { type: String },
    longevity: { type: String },
    sillage: { type: String },
    topNotes: [String],
    heartNotes: [String],
    baseNotes: [String],
    ingredients: [String],

    // ⭐ NEW — for dynamic rating everywhere
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 0 },

    // SOFT DELETE
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
