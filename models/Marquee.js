import mongoose from "mongoose";

const MarqueeSchema = new mongoose.Schema(
  {
    active: {
      type: Boolean,
      default: true,
    },
    lines: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Marquee ||
  mongoose.model("Marquee", MarqueeSchema);
