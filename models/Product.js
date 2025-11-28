// models/Product.js
import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },   // <-- New
});

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

    variants: [VariantSchema],  // includes stock

    fragranceType: { type: String },
    longevity: { type: String },
    sillage: { type: String },
    topNotes: [String],
    heartNotes: [String],
    baseNotes: [String],
    ingredients: [String],

    // SOFT DELETE
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
