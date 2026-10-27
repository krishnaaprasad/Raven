import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import BulkInvoice from "@/models/BulkInvoice";
import BulkPayment from "@/models/BulkPayment";
import { applyPaymentPipeline } from "@/lib/bulkPayments";

// DELETE /api/admin/bulk-sales/payments/[id] — reverse a wrongly recorded payment.
// The payment is soft-deleted and the invoice's amountPaid/status go back in the same
// transaction, so a double click can't reverse it twice.
export async function DELETE(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: "Payment not found" }, { status: 404 });
    }

    let reversed = null;
    let invoice = null;
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        reversed = await BulkPayment.findOneAndUpdate(
          { _id: id, deleted: { $ne: true } },
          { $set: { deleted: true } },
          { new: true, session }
        );
        if (!reversed) return;

        invoice = await BulkInvoice.findOneAndUpdate(
          { _id: reversed.invoiceId, deleted: { $ne: true } },
          applyPaymentPipeline(-reversed.amount),
          { new: true, session }
        );
        // Invoice gone/cancelled → abort, nothing changes
        if (!invoice) throw new Error("INVOICE_NOT_FOUND");
      });
    } catch (err) {
      if (err.message === "INVOICE_NOT_FOUND") {
        return NextResponse.json({ success: false, error: "Invoice not found or cancelled" }, { status: 404 });
      }
      throw err;
    } finally {
      await session.endSession();
    }

    if (!reversed) {
      return NextResponse.json({ success: false, error: "Payment already reversed" }, { status: 409 });
    }

    return NextResponse.json({ success: true, invoice });
  } catch (err) {
    console.error("BulkPayment DELETE error:", err);
    return NextResponse.json({ success: false, error: "Failed to reverse payment" }, { status: 500 });
  }
}
