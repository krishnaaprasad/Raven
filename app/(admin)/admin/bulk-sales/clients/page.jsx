"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Edit2, Trash2, X, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function BulkClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", company: "", phone: "", email: "", gst: "", address: "", city: "", state: "", creditLimit: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/bulk-sales/clients");
    const data = await res.json();
    if (data.success) setClients(data.clients || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  function openAdd() {
    setEditing(null);
    setForm({ name: "", company: "", phone: "", email: "", gst: "", address: "", city: "", state: "", creditLimit: "", notes: "" });
    setShowModal(true);
  }
  function openEdit(c) {
    setEditing(c);
    setForm({ name: c.name, company: c.company, phone: c.phone, email: c.email, gst: c.gst, address: c.address, city: c.city, state: c.state, creditLimit: c.creditLimit || "", notes: c.notes });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const url = editing ? `/api/admin/bulk-sales/clients/${editing._id}` : "/api/admin/bulk-sales/clients";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (data.success) { toast.success(editing ? "Updated" : "Client added"); setShowModal(false); fetchClients(); }
    else toast.error(data.error || "Failed");
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this client?")) return;
    const res = await fetch(`/api/admin/bulk-sales/clients/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) { toast.success("Deleted"); fetchClients(); }
    else toast.error(data.error || "Failed");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/bulk-sales" className="p-2 rounded-lg border border-[#e7e1cf] hover:bg-[#f5f1e6]"><ArrowLeft size={16} /></Link>
          <div>
            <h1 className="text-xl font-bold text-[#1b180d]">Bulk Clients</h1>
            <p className="text-xs text-[#6b6654]">{clients.length} wholesale clients</p>
          </div>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 h-9 px-4 bg-[#1b180d] text-white rounded-lg text-xs font-semibold"><Plus size={14} /> Add Client</button>
      </div>

      <div className="rounded-xl border border-[#e7e1cf] overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-[#1b180d]">
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Name</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Phone</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">City</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Outstanding</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-white/80">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece3]">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-sm text-[#6b6654]">Loading...</td></tr>
              ) : clients.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-sm text-[#9a864c]">No clients yet</td></tr>
              ) : clients.map((c) => (
                <tr key={c._id} className="hover:bg-[#faf8f3]">
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-semibold text-[#1b180d]">{c.name}</p>
                    {c.company && <p className="text-[11px] text-[#6b6654]">{c.company}</p>}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[#4a4637]">{c.phone}</td>
                  <td className="px-4 py-3 text-[12px] text-[#4a4637]">{c.city || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[13px] font-semibold ${c.outstanding > 0 ? "text-red-600" : "text-green-700"}`}>
                      ₹{Number(c.outstanding || 0).toLocaleString("en-IN")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openEdit(c)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#f5f1e6]"><Edit2 size={14} className="text-[#b28c34]" /></button>
                      <button onClick={() => handleDelete(c._id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5 text-[#1b180d]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold">{editing ? "Edit Client" : "Add Client"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-[#f5f1e6]"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name *" required className="w-full h-9 px-3 text-sm border border-[#e7e1cf] rounded-lg bg-white text-[#1b180d]" />
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company (optional)" className="w-full h-9 px-3 text-sm border border-[#e7e1cf] rounded-lg bg-white text-[#1b180d]" />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone *" required className="w-full h-9 px-3 text-sm border border-[#e7e1cf] rounded-lg bg-white text-[#1b180d]" />
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full h-9 px-3 text-sm border border-[#e7e1cf] rounded-lg bg-white text-[#1b180d]" />
              <input value={form.gst} onChange={(e) => setForm({ ...form, gst: e.target.value })} placeholder="GST Number" className="w-full h-9 px-3 text-sm border border-[#e7e1cf] rounded-lg bg-white text-[#1b180d]" />
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" className="w-full h-9 px-3 text-sm border border-[#e7e1cf] rounded-lg bg-white text-[#1b180d]" />
              <div className="grid grid-cols-2 gap-2">
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="h-9 px-3 text-sm border border-[#e7e1cf] rounded-lg bg-white text-[#1b180d]" />
                <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State" className="h-9 px-3 text-sm border border-[#e7e1cf] rounded-lg bg-white text-[#1b180d]" />
              </div>
              <input type="number" value={form.creditLimit} onChange={(e) => setForm({ ...form, creditLimit: e.target.value })} placeholder="Credit Limit (₹)" className="w-full h-9 px-3 text-sm border border-[#e7e1cf] rounded-lg bg-white text-[#1b180d]" />
              <button type="submit" disabled={saving} className="w-full h-9 bg-[#b28c34] text-white rounded-lg text-xs font-semibold hover:bg-[#9a864c] disabled:opacity-60">
                {saving ? "Saving..." : editing ? "Update" : "Add Client"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
