import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["PERCENT", "FLAT"],
      required: true,
    },

    value: {
      type: Number,
      required: true,
      min: [0.01, "Coupon value must be greater than 0"],
      validate: {
        validator: function (v) {
          if (this.type === "PERCENT") return v <= 100;
          return true;
        },
        message: "PERCENT coupon value must be between 0.01 and 100",
      },
    },

    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxDiscount: {
      type: Number,
      default: null,
      min: 0,
    },

    usageLimit: {
      type: Number,
      default: null,
      min: 0,
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    deleted: {
      type: Boolean,
      default: false,
    },

    isSingleUsePerUser: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ Partial unique index (supports soft delete)
couponSchema.index(
  { code: 1 },
  { unique: true, partialFilterExpression: { deleted: false } }
);

couponSchema.index({ code: 1, isActive: 1, deleted: 1 });

const Coupon =
  mongoose.models.Coupon ||
  mongoose.model("Coupon", couponSchema);

export default Coupon;