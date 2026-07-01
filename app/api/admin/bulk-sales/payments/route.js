import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import BulkInvoice from "@/models/BulkInvoice";
import BulkPayment from "@/models/BulkPayment";

// GET /api/admin/bulk-sales/payments?invoiceId=...&clientId=...
export async function GET(req) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get("invoiceId");
    const clientId = searchParams.get("clientId");

    const filter = { deleted: { $ne: true } };
    if (invoiceId) filter.invoiceId = invoiceId;
    if (clientId) filter.clientId = clientId;

    const payments = await BulkPayment.find(filter).sort({ paymentDate: -1 }).lean();
    return NextResponse.json({ success: true, payments });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/admin/bulk-sales/payments
export async function POST(req) {
  try {
    await connectToDatabase();
    const { invoiceId, amount, paymentDate, paymentMode, reference, notes } = await req.json();

    if (!invoiceId) {
      return NextResponse.json({ success: false, error: "Invoice ID required" }, { status: 400 });
    }

    const invoice = await BulkInvoice.findById(invoiceId);
    if (!invoice || invoice.deleted) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.paymentStatus === "received") {
      return NextResponse.json({ success: false, error: "Invoice already fully paid" }, { status: 400 });
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ success: false, error: "Amount must be a positive number" }, { status: 400 });
    }

    const remaining = invoice.totalAmount - invoice.amountPaid;
    if (parsedAmount > remaining) {
      return NextResponse.json(
        { success: false, error: `Payment exceeds remaining balance. Max: ₹${remaining}` },
        { status: 400 }
      );
    }

    // Create payment
    const payment = await BulkPayment.create({
      invoiceId: invoice._id,
      clientId: invoice.clientId,
      amount: parsedAmount,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentMode: paymentMode || "UPI",
      reference: reference || "",
      notes: notes || "",
    });

    // Update invoice
    const newAmountPaid = invoice.amountPaid + parsedAmount;
    let newStatus = "pending";
    if (newAmountPaid >= invoice.totalAmount) newStatus = "received";
    else if (newAmountPaid > 0) newStatus = "partial";

    const updatedInvoice = await BulkInvoice.findByIdAndUpdate(
      invoice._id,
      { amountPaid: newAmountPaid, paymentStatus: newStatus },
      { new: true }
    );

    return NextResponse.json({ success: true, payment, invoice: updatedInvoice }, { status: 201 });
  } catch (err) {
    console.error("BulkPayment POST error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
