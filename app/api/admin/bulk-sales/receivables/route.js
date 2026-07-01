import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import BulkInvoice from "@/models/BulkInvoice";

// GET /api/admin/bulk-sales/receivables
export async function GET() {
  try {
    await connectToDatabase();

    const now = new Date();

    // Get all unpaid/partial invoices
    const invoices = await BulkInvoice.find({
      deleted: { $ne: true },
      paymentStatus: { $ne: "received" },
    })
      .select("clientId clientName totalAmount amountPaid dueDate paymentStatus")
      .lean();

    let totalOutstanding = 0;
    let totalOverdue = 0;
    const agingBuckets = { current: 0, days_30_60: 0, days_60_90: 0, days_90_plus: 0 };
    const clientMap = {};

    for (const inv of invoices) {
      const outstanding = inv.totalAmount - inv.amountPaid;
      totalOutstanding += outstanding;

      const daysOverdue = Math.max(0, Math.floor((now - new Date(inv.dueDate)) / (1000 * 60 * 60 * 24)));

      if (new Date(inv.dueDate) < now) {
        totalOverdue += outstanding;
      }

      if (daysOverdue <= 30) agingBuckets.current += outstanding;
      else if (daysOverdue <= 60) agingBuckets.days_30_60 += outstanding;
      else if (daysOverdue <= 90) agingBuckets.days_60_90 += outstanding;
      else agingBuckets.days_90_plus += outstanding;

      // Client breakdown
      const cid = inv.clientId.toString();
      if (!clientMap[cid]) {
        clientMap[cid] = { clientId: cid, clientName: inv.clientName, outstanding: 0, invoiceCount: 0 };
      }
      clientMap[cid].outstanding += outstanding;
      clientMap[cid].invoiceCount += 1;
    }

    const clientBreakdown = Object.values(clientMap).sort((a, b) => b.outstanding - a.outstanding);

    return NextResponse.json({
      success: true,
      totalOutstanding,
      totalOverdue,
      agingBuckets,
      clientBreakdown,
    });
  } catch (err) {
    console.error("Receivables GET error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
