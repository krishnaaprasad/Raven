import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    brand: { type: String },
    name: { type: String, required: true },
    description: { type: String },

    // 🖼️ Product images
    images: [
      {
        original: String,
        thumbnail: String,
      },
    ],

    // ⭐ Ratings
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    // 🌿 Benefits section
    benefits: [String],

    // 💰 Product variants (size, price)
    variants: [
      {
        size: String,
        price: Number,
      },
    ],

    // ✨ Dynamic perfume attributes
    fragranceType: { type: String },
    longevity: { type: String },
    sillage: { type: String },
    topNotes: [String],
    heartNotes: [String],
    baseNotes: [String],
    ingredients: [String],
  },
  { timestamps: true }
);

// ✅ Prevent model overwrite errors in Next.js hot reload
export default mongoose.models?.Product || mongoose.model("Product", ProductSchema);
