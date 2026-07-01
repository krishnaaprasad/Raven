"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Trash2,
  X,
  IndianRupee,
  Clock,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function BulkSalesPage() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [filterClient, setFilterClient] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(null);

  // Receivables summary
  const [receivables, setReceivables] = useState(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (filterClient) params.set("clientId", filterClient);
      if (filterStatus) params.set("status", filterStatus);
      const res = await fetch(`/api/admin/bulk-sales/invoices?${params}`);
      const data = await res.json();
      if (data.success) {
        setInvoices(data.invoices || []);
        setTotal(data.total || 0);
        setTotalPages(data.pages || 1);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, filterClient, filterStatus]);

  const fetchClients = useCallback(async () => {
    const res = await fetch("/api/admin/bulk-sales/clients");
    const data = await res.json();
    if (data.success) setClients(data.clients || []);
  }, []);

  const fetchProducts = useCallback(async () => {
    const res = await fetch("/api/admin/products?limit=100");
    const data = await res.json();
    if (data.success) setProducts(data.data || []);
  }, []);

  const fetchReceivables = useCallback(async () => {
    const res = await fetch("/api/admin/bulk-sales/receivables");
    const data = await res.json();
    if (data.success) setReceivables(data);
  }, []);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);
  useEffect(() => { fetchClients(); fetchProducts(); fetchReceivables(); }, [fetchClients, fetchProducts, fetchReceivables]);

  async function handleDeleteInvoice(id) {
    if (!confirm("Cancel this invoice? Stock will be restored.")) return;
    const res = await fetch(`/api/admin/bulk-sales/invoices/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) { toast.success("Invoice cancelled"); fetchInvoices(); fetchReceivables(); }
    else toast.error(data.error || "Failed");
  }

  const statusBadge = (status) => {
    if (status === "received") return <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-green-50 text-green-700">Received</span>;
    if (status === "partial") return <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-yellow-50 text-yellow-700">Partial</span>;
    return <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-red-50 text-red-600">Pending</span>;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1b180d]">Bulk Sales</h1>
          <p className="text-xs text-[#6b6654]">Wholesale invoices, payments & receivables</p>
        </div>
        <div className="flex gap-2">
          <a href="/admin/bulk-sales/clients" className="inline-flex items-center gap-2 h-9 px-3 border border-[#e7e1cf] rounded-lg text-xs font-medium hover:bg-[#f5f1e6]">Clients</a>
          <button onClick={() => setShowCreateModal(true)} className="inline-flex items-center gap-2 h-9 px-4 bg-[#1b180d] text-white rounded-lg text-xs font-semibold hover:bg-[#2a2618]">
            <Plus size={14} /> Create Invoice
          </button>
        </div>
      </div>

      {/* Receivables Summary */}
      {receivables && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MiniCard label="Total Outstanding" value={`₹${Number(receivables.totalOutstanding || 0).toLocaleString("en-IN")}`} />
          <MiniCard label="Overdue" value={`₹${Number(receivables.totalOverdue || 0).toLocaleString("en-IN")}`} warning={receivables.totalOverdue > 0} />
          <MiniCard label="0-30 Days" value={`₹${Number(receivables.agingBuckets?.current || 0).toLocaleString("en-IN")}`} />
          <MiniCard label="90+ Days" value={`₹${Number(receivables.agingBuckets?.days_90_plus || 0).toLocaleString("en-IN")}`} warning={receivables.agingBuckets?.days_90_plus > 0} />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <select value={filterClient} onChange={(e) => { setFilterClient(e.target.value); setPage(1); }} className="h-9 px-3 rounded-lg border border-[#e7e1cf] bg-white text-xs text-[#1b180d]">
          <option value="">All Clients</option>
          {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="h-9 px-3 rounded-lg border border-[#e7e1cf] bg-white text-xs text-[#1b180d]">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="received">Received</option>
        </select>
      </div>

      {/* Invoice Table */}
      <div className="rounded-xl border border-[#e7e1cf] overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-[#1b180d]">
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Invoice</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Client</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Date</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Amount</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Paid</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Due</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-white/80">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece3]">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-sm text-[#6b6654]">Loading...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-sm text-[#9a864c]">No invoices found</td></tr>
              ) : invoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-[#faf8f3] transition-colors">
                  <td className="px-4 py-3 text-[13px] font-semibold text-[#1b180d]">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 text-[12px] text-[#4a4637]">{inv.clientName}</td>
                  <td className="px-4 py-3 text-[12px] text-[#4a4637]">{new Date(inv.invoiceDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}</td>
                  <td className="px-4 py-3 text-[13px] font-semibold">₹{Number(inv.totalAmount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-[12px] text-green-700">₹{Number(inv.amountPaid || 0).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">{statusBadge(inv.paymentStatus)}</td>
                  <td className="px-4 py-3 text-[12px] text-[#6b6654]">{new Date(inv.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {inv.paymentStatus !== "received" && (
                        <button onClick={() => setShowPaymentModal(inv)} title="Record Payment" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-green-50 text-green-600"><IndianRupee size={14} /></button>
                      )}
                      {inv.amountPaid === 0 && (
                        <button onClick={() => handleDeleteInvoice(inv._id)} title="Cancel" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#f0ece3] text-xs">
            <p className="text-[#6b6654]">Page {page} of {totalPages} ({total} invoices)</p>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-1.5 rounded border border-[#e7e1cf] disabled:opacity-40"><ChevronLeft size={14} /></button>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="p-1.5 rounded border border-[#e7e1cf] disabled:opacity-40"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <CreateInvoiceModal
          clients={clients}
          products={products}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); fetchInvoices(); fetchReceivables(); }}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          invoice={showPaymentModal}
          onClose={() => setShowPaymentModal(null)}
          onSuccess={() => { setShowPaymentModal(null); fetchInvoices(); fetchReceivables(); }}
        />
      )}
    </div>
  );
}

function MiniCard({ label, value, warning }) {
  return (
    <div className={`rounded-xl border p-4 bg-white ${warning ? "border-red-200" : "border-[#e7e1cf]"}`}>
      <p className={`text-lg font-bold ${warning ? "text-red-600" : "text-[#1b180d]"}`}>{value}</p>
      <p className="text-[11px] text-[#6b6654]">{label}</p>
    </div>
  );
}

function PaymentModal({ invoice, onClose, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("UPI");
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);
  const remaining = invoice.totalAmount - invoice.amountPaid;

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/bulk-sales/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId: invoice._id, amount: Number(amount), paymentMode: mode, reference }),
    });
    const data = await res.json();
    if (data.success) { toast.success("Payment recorded"); onSuccess(); }
    else toast.error(data.error || "Failed");
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-5 text-[#1b180d]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold">Record Payment — {invoice.invoiceNumber}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#f5f1e6]"><X size={16} /></button>
        </div>
        <p className="text-xs text-[#6b6654] mb-3">Remaining: ₹{remaining.toLocaleString("en-IN")}</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" max={remaining} min="1" required className="w-full h-9 px-3 text-sm border border-[#e7e1cf] rounded-lg bg-white text-[#1b180d]" />
          <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full h-9 px-3 text-sm border border-[#e7e1cf] rounded-lg bg-white text-[#1b180d]">
            <option>UPI</option><option>Cash</option><option>Bank Transfer</option><option>Cheque</option>
          </select>
          <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Reference / Txn ID (optional)" className="w-full h-9 px-3 text-sm border border-[#e7e1cf] rounded-lg bg-white text-[#1b180d]" />
          <button type="submit" disabled={saving} className="w-full h-9 bg-[#b28c34] text-white rounded-lg text-xs font-semibold hover:bg-[#9a864c] disabled:opacity-60">
            {saving ? "Saving..." : "Record Payment"}
          </button>
        </form>
      </div>
    </div>
  );
}

function CreateInvoiceModal({ clients, products, onClose, onSuccess }) {
  const [clientId, setClientId] = useState("");
  const [lineItems, setLineItems] = useState([{ productId: "", variantSize: "", quantity: 1, unitPrice: "", discount: 0 }]);
  const [shipping, setShipping] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function addLine() {
    setLineItems([...lineItems, { productId: "", variantSize: "", quantity: 1, unitPrice: "", discount: 0 }]);
  }

  function removeLine(i) {
    setLineItems(lineItems.filter((_, idx) => idx !== i));
  }

  function updateLine(i, field, value) {
    const updated = [...lineItems];
    updated[i][field] = value;
    // Auto-fill price when product+variant selected
    if (field === "variantSize" || field === "productId") {
      const prod = products.find((p) => p._id === updated[i].productId);
      const variant = prod?.variants?.find((v) => v.size === updated[i].variantSize);
      if (variant) updated[i].unitPrice = variant.price;
    }
    setLineItems(updated);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!clientId) { setError("Select a client"); return; }
    if (lineItems.some((l) => !l.productId || !l.variantSize)) { setError("Fill all line items"); return; }

    setSaving(true);
    const res = await fetch("/api/admin/bulk-sales/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        lineItems: lineItems.map((l) => ({ ...l, quantity: Number(l.quantity), unitPrice: Number(l.unitPrice), discount: Number(l.discount) })),
        shipping: Number(shipping),
        totalDiscount: Number(totalDiscount),
        dueDate: dueDate || undefined,
        notes,
      }),
    });
    const data = await res.json();
    if (data.success) { toast.success(`Invoice ${data.invoice.invoiceNumber} created`); onSuccess(); }
    else { setError(data.error || "Failed"); if (data.details) setError(data.details.map((d) => `${d.productName}: ${d.available} available`).join(", ")); }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-5 text-[#1b180d]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold">Create Bulk Invoice</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#f5f1e6]"><X size={18} /></button>
        </div>

        {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client */}
          <div>
            <label className="text-[11px] font-medium text-[#6b6654]">Client</label>
            <select value={clientId} onChange={(e) => setClientId(e.target.value)} required className="w-full h-9 px-3 text-sm border border-[#e7e1cf] rounded-lg bg-white text-[#1b180d]">
              <option value="">Select client...</option>
              {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          {/* Line Items */}
          <div>
            <label className="text-[11px] font-medium text-[#6b6654] mb-2 block">Line Items</label>
            {lineItems.map((line, i) => {
              const prod = products.find((p) => p._id === line.productId);
              return (
                <div key={i} className="flex flex-wrap gap-2 mb-2 p-2 bg-[#fcfbf8] rounded-lg border border-[#e7e1cf]">
                  <select value={line.productId} onChange={(e) => updateLine(i, "productId", e.target.value)} className="h-8 px-2 text-xs border border-[#e7e1cf] rounded bg-white flex-1 min-w-[120px] text-[#1b180d]">
                    <option value="">Product</option>
                    {products.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                  <select value={line.variantSize} onChange={(e) => updateLine(i, "variantSize", e.target.value)} className="h-8 px-2 text-xs border border-[#e7e1cf] rounded bg-white w-20 text-[#1b180d]">
                    <option value="">Size</option>
                    {prod?.variants?.map((v) => <option key={v.size} value={v.size}>{v.size}ml</option>)}
                  </select>
                  <input type="number" value={line.quantity} onChange={(e) => updateLine(i, "quantity", e.target.value)} min="1" className="h-8 px-2 text-xs border border-[#e7e1cf] rounded bg-white w-14 text-[#1b180d]" placeholder="Qty" />
                  <input type="number" value={line.unitPrice} onChange={(e) => updateLine(i, "unitPrice", e.target.value)} className="h-8 px-2 text-xs border border-[#e7e1cf] rounded bg-white w-20 text-[#1b180d]" placeholder="Price" />
                  <input type="number" value={line.discount} onChange={(e) => updateLine(i, "discount", e.target.value)} className="h-8 px-2 text-xs border border-[#e7e1cf] rounded bg-white w-20 text-[#1b180d]" placeholder="Disc" />
                  {lineItems.length > 1 && <button type="button" onClick={() => removeLine(i)} className="h-8 w-8 flex items-center justify-center rounded text-red-400 hover:bg-red-50"><X size={14} /></button>}
                </div>
              );
            })}
            <button type="button" onClick={addLine} className="text-xs text-[#b28c34] font-medium hover:underline">+ Add Item</button>
          </div>

          {/* Shipping & Discount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-[#6b6654]">Shipping (₹)</label>
              <input type="number" value={shipping} onChange={(e) => setShipping(e.target.value)} className="w-full h-9 px-3 text-sm border border-[#e7e1cf] rounded-lg bg-white text-[#1b180d]" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-[#6b6654]">Invoice Discount (₹)</label>
              <input type="number" value={totalDiscount} onChange={(e) => setTotalDiscount(e.target.value)} className="w-full h-9 px-3 text-sm border border-[#e7e1cf] rounded-lg bg-white text-[#1b180d]" />
            </div>
          </div>

          {/* Due Date & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-[#6b6654]">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full h-9 px-3 text-sm border border-[#e7e1cf] rounded-lg bg-white text-[#1b180d]" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-[#6b6654]">Notes</label>
              <input value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full h-9 px-3 text-sm border border-[#e7e1cf] rounded-lg bg-white text-[#1b180d]" placeholder="Optional" />
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full h-10 bg-[#b28c34] text-white rounded-lg text-sm font-semibold hover:bg-[#9a864c] disabled:opacity-60">
            {saving ? "Creating..." : "Create Invoice"}
          </button>
        </form>
      </div>
    </div>
  );
}
