import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import BulkClient from "@/models/BulkClient";
import BulkInvoice from "@/models/BulkInvoice";
import BulkInvoiceCounter from "@/models/BulkInvoiceCounter";
import Product from "@/models/Product";
import StockLog from "@/models/StockLog";

async function generateInvoiceNumber() {
  const counter = await BulkInvoiceCounter.findOneAndUpdate(
    { prefix: "RVN-B" },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return `#${String(counter.seq).padStart(3, "0")}`;
}

// GET /api/admin/bulk-sales/invoices
export async function GET(req) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId") || "";
    const status = searchParams.get("status") || "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));

    const filter = { deleted: { $ne: true } };
    if (clientId) filter.clientId = clientId;
    if (status && ["pending", "partial", "received"].includes(status)) filter.paymentStatus = status;

    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      BulkInvoice.find(filter).sort({ invoiceDate: -1 }).skip(skip).limit(limit).lean(),
      BulkInvoice.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      invoices,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("BulkInvoices GET error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/admin/bulk-sales/invoices
export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { clientId, lineItems, shipping = 0, totalDiscount = 0, dueDate, notes, invoiceDate } = body;

    // Validate client
    const client = await BulkClient.findById(clientId);
    if (!client || client.deleted) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    if (!lineItems || !lineItems.length) {
      return NextResponse.json({ success: false, error: "At least one line item required" }, { status: 400 });
    }

    // Process line items — validate products, check stock, capture costs
    const processedItems = [];
    const stockErrors = [];

    for (const item of lineItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json({ success: false, error: `Product not found: ${item.productId}` }, { status: 400 });
      }

      const variant = product.variants.find((v) => String(v.size) === String(item.variantSize));
      if (!variant) {
        return NextResponse.json({ success: false, error: `Variant ${item.variantSize} not found for ${product.name}` }, { status: 400 });
      }

      const qty = Number(item.quantity) || 1;
      if (variant.stock < qty) {
        stockErrors.push({ productName: product.name, variantSize: item.variantSize, available: variant.stock, requested: qty });
      }

      const unitPrice = Number(item.unitPrice) || variant.price;
      const discount = Number(item.discount) || 0;
      const lineTotal = (unitPrice * qty) - discount;

      processedItems.push({
        productId: product._id,
        productName: product.name,
        variantSize: variant.size,
        sku: product.slug?.substring(0, 3).toUpperCase() || "",
        quantity: qty,
        unitPrice,
        unitCost: variant.total_cost || 0,
        discount,
        lineTotal,
      });
    }

    if (stockErrors.length > 0) {
      return NextResponse.json({ success: false, error: "Insufficient stock", details: stockErrors }, { status: 400 });
    }

    // Calculate totals
    const subtotal = processedItems.reduce((s, i) => s + i.lineTotal, 0);
    const totalAmount = subtotal - Number(totalDiscount) + Number(shipping);
    const totalCogs = processedItems.reduce((s, i) => s + (i.unitCost * i.quantity), 0);
    const grossProfit = totalAmount - totalCogs;

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Default due date: 30 days from invoice date
    const invDate = invoiceDate ? new Date(invoiceDate) : new Date();
    const due = dueDate ? new Date(dueDate) : new Date(invDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Create invoice
    const invoice = await BulkInvoice.create({
      invoiceNumber,
      clientId: client._id,
      clientName: client.name,
      invoiceDate: invDate,
      dueDate: due,
      lineItems: processedItems,
      subtotal,
      shipping: Number(shipping),
      totalDiscount: Number(totalDiscount),
      totalAmount,
      totalCogs,
      grossProfit,
      notes: notes || "",
    });

    // Deduct stock
    const stockLogs = [];
    for (const item of processedItems) {
      const product = await Product.findOne({ _id: item.productId, "variants.size": item.variantSize });
      const variant = product?.variants?.find((v) => v.size === item.variantSize);
      const previousStock = variant?.stock || 0;

      await Product.updateOne(
        { _id: item.productId, "variants.size": item.variantSize },
        { $inc: { "variants.$.stock": -item.quantity } }
      );

      stockLogs.push({
        productId: item.productId,
        variantSize: item.variantSize,
        type: "BULK_SALE",
        quantity: -item.quantity,
        previousStock,
        newStock: previousStock - item.quantity,
        orderId: invoice._id,
        reason: `Bulk invoice ${invoiceNumber} — ${client.name}`,
        by: "admin",
      });
    }

    if (stockLogs.length) await StockLog.insertMany(stockLogs);
    await BulkInvoice.findByIdAndUpdate(invoice._id, { stockDeducted: true });

    return NextResponse.json({ success: true, invoice }, { status: 201 });
  } catch (err) {
    console.error("BulkInvoice POST error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
