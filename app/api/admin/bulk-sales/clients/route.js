import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import BulkClient from "@/models/BulkClient";
import BulkInvoice from "@/models/BulkInvoice";

// GET /api/admin/bulk-sales/clients
export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    const filter = { deleted: { $ne: true } };
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { company: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
      ];
    }

    const clients = await BulkClient.find(filter).sort({ name: 1 }).lean();

    // Compute outstanding per client
    const outstandingAgg = await BulkInvoice.aggregate([
      { $match: { deleted: { $ne: true }, paymentStatus: { $ne: "received" } } },
      {
        $group: {
          _id: "$clientId",
          outstanding: { $sum: { $subtract: ["$totalAmount", "$amountPaid"] } },
          invoiceCount: { $sum: 1 },
        },
      },
    ]);

    const outstandingMap = {};
    outstandingAgg.forEach((o) => {
      outstandingMap[o._id.toString()] = { outstanding: o.outstanding, invoiceCount: o.invoiceCount };
    });

    const result = clients.map((c) => ({
      ...c,
      outstanding: outstandingMap[c._id.toString()]?.outstanding || 0,
      pendingInvoices: outstandingMap[c._id.toString()]?.invoiceCount || 0,
    }));

    return NextResponse.json({ success: true, clients: result });
  } catch (err) {
    console.error("BulkClients GET error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/admin/bulk-sales/clients
export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { name, company, phone, email, gst, address, city, state, creditLimit, notes } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json({ success: false, error: "Phone is required" }, { status: 400 });
    }

    const client = await BulkClient.create({
      name: name.trim(),
      company: company || "",
      phone: phone.trim(),
      email: email || "",
      gst: gst || "",
      address: address || "",
      city: city || "",
      state: state || "",
      creditLimit: Number(creditLimit) || 0,
      notes: notes || "",
    });

    return NextResponse.json({ success: true, client }, { status: 201 });
  } catch (err) {
    console.error("BulkClients POST error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
