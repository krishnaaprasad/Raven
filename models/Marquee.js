// models/Marquee.js
import mongoose from "mongoose";

const MarqueeSchema = new mongoose.Schema(
  {
    active: { type: Boolean, default: true },
    lines: [
      {
        text: { type: String, required: true },
        icon: { type: String, default: "Sparkles" },
        link: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Marquee ||
  mongoose.model("Marquee", MarqueeSchema);
