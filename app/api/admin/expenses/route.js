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

// GET /api/admin/expenses?page=1&limit=20&category=&from=&to=
export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const category = searchParams.get("category") || "";
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";

    const filter = { deleted: { $ne: true } };

    if (category && VALID_CATEGORIES.includes(category)) {
      filter.category = category;
    }

    if (from || to) {
      filter.date = {};
      if (from) {
        const fromDate = new Date(from);
        if (isNaN(fromDate.getTime())) {
          return NextResponse.json({ success: false, error: "Invalid 'from' date" }, { status: 400 });
        }
        filter.date.$gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        if (isNaN(toDate.getTime())) {
          return NextResponse.json({ success: false, error: "Invalid 'to' date" }, { status: 400 });
        }
        toDate.setHours(23, 59, 59, 999);
        filter.date.$lte = toDate;
      }
    }

    const skip = (page - 1) * limit;

    const [expenses, total, totalAmountAgg] = await Promise.all([
      Expense.find(filter).sort({ date: -1 }).skip(skip).limit(limit).lean(),
      Expense.countDocuments(filter),
      Expense.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    return NextResponse.json({
      success: true,
      expenses,
      total,
      page,
      pages: Math.ceil(total / limit),
      totalAmount: totalAmountAgg[0]?.total || 0,
    });
  } catch (err) {
    console.error("Expenses GET error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/admin/expenses
export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const { date, category, description, amount, payment_mode, notes } = body;

    // Validation
    const errors = [];
    if (!date) errors.push("date is required");
    if (!category) errors.push("category is required");
    if (!description || !description.trim()) errors.push("description is required");

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      errors.push("amount must be a positive finite number");
    }

    if (category && !VALID_CATEGORIES.includes(category)) {
      errors.push(`category must be one of: ${VALID_CATEGORIES.join(", ")}`);
    }

    if (payment_mode && !VALID_MODES.includes(payment_mode)) {
      errors.push(`payment_mode must be one of: ${VALID_MODES.join(", ")}`);
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      errors.push("Invalid date format");
    } else if (parsedDate > new Date()) {
      errors.push("Date cannot be in the future");
    }

    if (errors.length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const expense = await Expense.create({
      date: parsedDate,
      category,
      description: description.trim(),
      amount: parsedAmount,
      payment_mode: payment_mode || "UPI",
      notes: notes || "",
    });

    return NextResponse.json({ success: true, expense }, { status: 201 });
  } catch (err) {
    console.error("Expenses POST error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
