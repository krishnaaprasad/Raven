import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import BulkClient from "@/models/BulkClient";
import BulkInvoice from "@/models/BulkInvoice";

// PATCH /api/admin/bulk-sales/clients/[id]
export async function PATCH(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const client = await BulkClient.findById(id);
    if (!client || client.deleted) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    const { name, company, phone, email, gst, address, city, state, creditLimit, notes } = body;

    if (name !== undefined) client.name = name.trim();
    if (company !== undefined) client.company = company;
    if (phone !== undefined) client.phone = phone.trim();
    if (email !== undefined) client.email = email;
    if (gst !== undefined) client.gst = gst;
    if (address !== undefined) client.address = address;
    if (city !== undefined) client.city = city;
    if (state !== undefined) client.state = state;
    if (creditLimit !== undefined) client.creditLimit = Number(creditLimit) || 0;
    if (notes !== undefined) client.notes = notes;

    await client.save();
    return NextResponse.json({ success: true, client });
  } catch (err) {
    console.error("BulkClient PATCH error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/bulk-sales/clients/[id]
export async function DELETE(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const client = await BulkClient.findById(id);
    if (!client) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    // Check for unpaid invoices
    const unpaidCount = await BulkInvoice.countDocuments({
      clientId: id,
      deleted: { $ne: true },
      paymentStatus: { $ne: "received" },
    });

    if (unpaidCount > 0) {
      return NextResponse.json(
        { success: false, error: `Client has ${unpaidCount} unpaid invoice(s). Resolve them first.` },
        { status: 400 }
      );
    }

    client.deleted = true;
    await client.save();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("BulkClient DELETE error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
