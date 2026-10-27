import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import BulkInvoice from "@/models/BulkInvoice";
import BulkPayment from "@/models/BulkPayment";

// Update pipeline: add `amount` to amountPaid and recompute paymentStatus from the new value,
// both in one atomic write
function applyPaymentPipeline(amount) {
  return [
    { $set: { amountPaid: { $add: ["$amountPaid", amount] } } },
    {
      $set: {
        paymentStatus: {
          $switch: {
            branches: [
              { case: { $gte: ["$amountPaid", "$totalAmount"] }, then: "received" },
              { case: { $gt: ["$amountPaid", 0] }, then: "partial" },
            ],
            default: "pending",
          },
        },
      },
    },
  ];
}

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

    // Atomic add with the balance check in the same update — two payments saved at once
    // used to read the same amountPaid and one of them was lost. paymentStatus is derived
    // in the same update (a separate write could land out of order and show "partial").
    const incremented = await BulkInvoice.findOneAndUpdate(
      {
        _id: invoice._id,
        deleted: { $ne: true },
        $expr: { $lte: [{ $add: ["$amountPaid", parsedAmount] }, "$totalAmount"] },
      },
      applyPaymentPipeline(parsedAmount),
      { new: true }
    );
    if (!incremented) {
      return NextResponse.json(
        { success: false, error: "Payment exceeds remaining balance (another payment may have just been recorded)" },
        { status: 409 }
      );
    }

    let payment;
    try {
      payment = await BulkPayment.create({
        invoiceId: invoice._id,
        clientId: invoice.clientId,
        amount: parsedAmount,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        paymentMode: paymentMode || "UPI",
        reference: reference || "",
        notes: notes || "",
      });
    } catch (createErr) {
      await BulkInvoice.updateOne({ _id: invoice._id }, applyPaymentPipeline(-parsedAmount));
      throw createErr;
    }

    return NextResponse.json({ success: true, payment, invoice: incremented }, { status: 201 });
  } catch (err) {
    console.error("BulkPayment POST error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
