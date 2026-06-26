import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Expense from "@/models/Expense";

const VALID_CATEGORIES = [
  "Software/App",
  "Branding/Design",
  "Packaging",
  "Marketing",
  "Shipping",
  "Operations",
  "Other",
];

const VALID_MODES = ["Cash", "UPI", "Bank Transfer", "Card"];

// PATCH /api/admin/expenses/[id]
export async function PATCH(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    // Validate ObjectId format
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json({ success: false, error: "Invalid expense ID" }, { status: 400 });
    }

    const body = await req.json();

    const expense = await Expense.findById(id);
    if (!expense || expense.deleted) {
      return NextResponse.json({ success: false, error: "Expense not found" }, { status: 404 });
    }

    const { date, category, description, amount, payment_mode, notes } = body;

    if (date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json({ success: false, error: "Invalid date" }, { status: 400 });
      }
      if (parsedDate > new Date()) {
        return NextResponse.json({ success: false, error: "Date cannot be future" }, { status: 400 });
      }
      expense.date = parsedDate;
    }

    if (category) {
      if (!VALID_CATEGORIES.includes(category)) {
        return NextResponse.json({ success: false, error: "Invalid category" }, { status: 400 });
      }
      expense.category = category;
    }

    if (description !== undefined) {
      if (typeof description !== "string" || !description.trim()) {
        return NextResponse.json({ success: false, error: "Description cannot be empty" }, { status: 400 });
      }
      expense.description = description.trim();
    }
    if (amount !== undefined) {
      const parsedAmount = Number(amount);
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        return NextResponse.json({ success: false, error: "Amount must be a positive number" }, { status: 400 });
      }
      expense.amount = parsedAmount;
    }
    if (payment_mode) {
      if (!VALID_MODES.includes(payment_mode)) {
        return NextResponse.json({ success: false, error: "Invalid payment mode" }, { status: 400 });
      }
      expense.payment_mode = payment_mode;
    }
    if (notes !== undefined) expense.notes = notes;

    await expense.save();

    return NextResponse.json({ success: true, expense });
  } catch (err) {
    console.error("Expense PATCH error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/expenses/[id]
export async function DELETE(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json({ success: false, error: "Invalid expense ID" }, { status: 400 });
    }

    const expense = await Expense.findById(id);
    if (!expense) {
      return NextResponse.json({ success: false, error: "Expense not found" }, { status: 404 });
    }

    expense.deleted = true;
    await expense.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Expense DELETE error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
