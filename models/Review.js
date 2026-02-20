// models/Review.js
import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: { type: String, required: true },

    rating: { type: Number, required: true, min: 1, max: 5 },

    title: { type: String, required: true },

    comment: { type: String, required: true },

    images: [
      {
        type: String, // Cloudinary URLs
      },
    ],

    helpful: { type: Number, default: 0 },

    isVerified: { type: Boolean, default: false },

    reply: { type: String, default: "" },
    replyAt: { type: Date },

    status: {
      type: String,
      default: "ACTIVE",
      enum: ["ACTIVE", "HIDDEN"],
    },

    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Review ||
  mongoose.model("Review", ReviewSchema);
