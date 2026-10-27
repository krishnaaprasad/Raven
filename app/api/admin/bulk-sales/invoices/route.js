import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import BulkClient from "@/models/BulkClient";
import BulkInvoice from "@/models/BulkInvoice";
import BulkInvoiceCounter from "@/models/BulkInvoiceCounter";
import Product from "@/models/Product";
import StockLog from "@/models/StockLog";
import { reserveStock, undoReservation } from "@/lib/orderInventory";

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

    const shippingNum = Number(shipping || 0);
    const totalDiscountNum = Number(totalDiscount || 0);
    if (!Number.isFinite(shippingNum) || shippingNum < 0 || !Number.isFinite(totalDiscountNum) || totalDiscountNum < 0) {
      return NextResponse.json({ success: false, error: "Shipping and discount must be 0 or more" }, { status: 400 });
    }

    if (!Array.isArray(lineItems) || !lineItems.length) {
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

      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty < 1) {
        return NextResponse.json({ success: false, error: `Quantity for ${product.name} must be a whole number of at least 1` }, { status: 400 });
      }
      if (variant.stock < qty) {
        stockErrors.push({ productName: product.name, variantSize: item.variantSize, available: variant.stock, requested: qty });
      }

      const unitPrice = item.unitPrice === "" || item.unitPrice == null ? Number(variant.price) : Number(item.unitPrice);
      const discount = Number(item.discount || 0);
      if (!Number.isFinite(unitPrice) || unitPrice < 0 || !Number.isFinite(discount) || discount < 0) {
        return NextResponse.json({ success: false, error: `Invalid price or discount for ${product.name}` }, { status: 400 });
      }
      const lineTotal = (unitPrice * qty) - discount;

      processedItems.push({
        productId: product._id,
        slug: product.slug,
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
    const totalAmount = subtotal - totalDiscountNum + shippingNum;
    if (totalAmount < 0) {
      return NextResponse.json({ success: false, error: "Discounts can't be more than the invoice amount" }, { status: 400 });
    }
    const totalCogs = processedItems.reduce((s, i) => s + (i.unitCost * i.quantity), 0);
    const grossProfit = totalAmount - totalCogs;

    // Take stock atomically before creating the invoice (the check above can race with
    // other sales; the same product on two lines also has to fit in stock together)
    const reservation = await reserveStock(
      processedItems.map((i) => ({ slug: i.slug, size: String(i.variantSize), quantity: i.quantity, name: i.productName }))
    );
    if (!reservation.ok) {
      return NextResponse.json(
        { success: false, error: `Insufficient stock for ${reservation.item.name} (${reservation.item.size})` },
        { status: 400 }
      );
    }

    // Generate invoice number
    let invoiceNumber;
    let invoice;
    try {
    invoiceNumber = await generateInvoiceNumber();

    // Default due date: 30 days from invoice date
    const invDate = invoiceDate ? new Date(invoiceDate) : new Date();
    const due = dueDate ? new Date(dueDate) : new Date(invDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Create invoice
    invoice = await BulkInvoice.create({
      invoiceNumber,
      clientId: client._id,
      clientName: client.name,
      invoiceDate: invDate,
      dueDate: due,
      lineItems: processedItems,
      subtotal,
      shipping: shippingNum,
      totalDiscount: totalDiscountNum,
      totalAmount,
      totalCogs,
      grossProfit,
      notes: notes || "",
      stockDeducted: true,
    });
    } catch (createErr) {
      await undoReservation(reservation.taken);
      throw createErr;
    }

    // Stock logs for the reservation taken above — best effort: the invoice and stock are
    // already saved, so a log failure must not report an error (staff would re-create it)
    try {
      const stockLogs = reservation.taken
        .filter((t) => t.product?._id)
        .map((t) => {
          const newStock = t.product.variants?.find((v) => String(v.size) === t.size)?.stock ?? 0;
          return {
            productId: t.product._id,
            variantSize: t.size,
            type: "BULK_SALE",
            quantity: -t.quantity,
            previousStock: newStock + t.quantity,
            newStock,
            orderId: invoice._id,
            reason: `Bulk invoice ${invoiceNumber} — ${client.name}`,
            by: "admin",
          };
        });
      if (stockLogs.length) await StockLog.insertMany(stockLogs);
    } catch (logErr) {
      console.error("BulkInvoice stock log write failed:", invoice.invoiceNumber, logErr.message);
    }

    return NextResponse.json({ success: true, invoice }, { status: 201 });
  } catch (err) {
    console.error("BulkInvoice POST error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
