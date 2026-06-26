import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    category: {
      type: String,
      enum: [
        "Software/App",
        "Branding/Design",
        "Packaging",
        "Marketing",
        "Shipping",
        "Operations",
        "Other",
      ],
      required: true,
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0.01 },
    payment_mode: {
      type: String,
      enum: ["Cash", "UPI", "Bank Transfer", "Card"],
      default: "UPI",
    },
    notes: { type: String, default: "" },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ category: 1, date: -1 });
ExpenseSchema.index({ deleted: 1, date: -1 });

const Expense =
  mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);

export default Expense;
