import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import BulkInvoice from "@/models/BulkInvoice";
import Product from "@/models/Product";
import StockLog from "@/models/StockLog";

// GET /api/admin/bulk-sales/invoices/[id]
export async function GET(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const invoice = await BulkInvoice.findById(id).populate("clientId", "name phone email").lean();
    if (!invoice) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, invoice });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/bulk-sales/invoices/[id] — Cancel invoice
export async function DELETE(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const invoice = await BulkInvoice.findById(id);
    if (!invoice || invoice.deleted) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.amountPaid > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot cancel invoice with existing payments. Reverse payments first." },
        { status: 400 }
      );
    }

    // Restore stock
    if (invoice.stockDeducted) {
      const stockLogs = [];
      for (const item of invoice.lineItems) {
        const product = await Product.findOne({ _id: item.productId, "variants.size": item.variantSize });
        const variant = product?.variants?.find((v) => v.size === item.variantSize);
        const previousStock = variant?.stock || 0;

        await Product.updateOne(
          { _id: item.productId, "variants.size": item.variantSize },
          { $inc: { "variants.$.stock": item.quantity } }
        );

        stockLogs.push({
          productId: item.productId,
          variantSize: item.variantSize,
          type: "BULK_SALE_CANCELLED",
          quantity: item.quantity,
          previousStock,
          newStock: previousStock + item.quantity,
          orderId: invoice._id,
          reason: `Cancelled bulk invoice ${invoice.invoiceNumber}`,
          by: "admin",
        });
      }
      if (stockLogs.length) await StockLog.insertMany(stockLogs);
    }

    invoice.deleted = true;
    await invoice.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("BulkInvoice DELETE error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
