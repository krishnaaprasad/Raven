"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Minus,
  Package,
  AlertTriangle,
  History,
  ChevronDown,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | low | out

  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [logsProductId, setLogsProductId] = useState(null);

  const [adjustModal, setAdjustModal] = useState(null); // { productId, productName, variantSize, currentStock }

  // Fetch all products
  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products?limit=1000");
      const json = await res.json();
      if (json.success) setProducts(json.data || []);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch stock logs
  async function fetchLogs(productId = null) {
    setLogsLoading(true);
    try {
      const url = productId
        ? `/api/admin/inventory/logs?productId=${productId}&limit=50`
        : `/api/admin/inventory/logs?limit=50`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) setLogs(json.logs || []);
    } catch (err) {
      console.error("Failed to load logs:", err);
    } finally {
      setLogsLoading(false);
    }
  }

  // Filter products
  const filtered = products.filter((p) => {
    if (p.deleted) return false;

    // Search
    if (search) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) return false;
    }

    // Stock filter
    if (filter === "low") {
      return p.variants?.some((v) => v.stock > 0 && v.stock <= 5);
    }
    if (filter === "out") {
      return p.variants?.every((v) => !v.stock || v.stock <= 0);
    }

    return true;
  });

  // Stats
  const totalVariants = products.reduce((s, p) => s + (p.variants?.length || 0), 0);
  const lowStockVariants = products.reduce(
    (s, p) => s + (p.variants?.filter((v) => v.stock > 0 && v.stock <= 5).length || 0),
    0
  );
  const outOfStockVariants = products.reduce(
    (s, p) => s + (p.variants?.filter((v) => !v.stock || v.stock <= 0).length || 0),
    0
  );
  const totalUnits = products.reduce(
    (s, p) => s + (p.variants?.reduce((vs, v) => vs + (v.stock || 0), 0) || 0),
    0
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1b180d]">Inventory</h1>
          <p className="text-xs text-[#6b6654]">Manage stock levels across all products</p>
        </div>
        <button
          onClick={() => { setShowLogs(true); setLogsProductId(null); fetchLogs(null); }}
          className="inline-flex items-center gap-2 h-9 px-4 border border-[#e7e1cf] rounded-lg text-xs font-medium hover:bg-[#f5f1e6] transition"
        >
          <History size={14} /> Stock History
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat label="Total Units" value={totalUnits.toLocaleString("en-IN")} />
        <MiniStat label="Total Variants" value={totalVariants} />
        <MiniStat label="Low Stock (≤5)" value={lowStockVariants} warning={lowStockVariants > 0} />
        <MiniStat label="Out of Stock" value={outOfStockVariants} warning={outOfStockVariants > 0} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center flex-1 min-w-[200px] max-w-sm h-9 rounded-lg border border-[#e7e1cf] bg-white px-3">
          <Search size={15} className="text-[#9a864c] shrink-0" />
          <input
            className="flex-1 ml-2 text-xs outline-none bg-transparent text-[#1b180d] placeholder:text-[#9a864c]"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")}><X size={14} className="text-[#6b6654]" /></button>
          )}
        </div>

        {[
          { val: "all", label: "All" },
          { val: "low", label: "Low Stock" },
          { val: "out", label: "Out of Stock" },
        ].map((f) => (
          <button
            key={f.val}
            onClick={() => setFilter(f.val)}
            className={`h-9 px-3 rounded-lg text-xs font-medium border transition ${
              filter === f.val
                ? "bg-[#b28c34] text-white border-[#b28c34]"
                : "bg-white border-[#e7e1cf] text-[#4a4637] hover:border-[#b28c34]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="rounded-xl border border-[#e7e1cf] overflow-hidden bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-sm text-[#6b6654]">
            <div className="w-5 h-5 border-2 border-[#b28c34] border-t-transparent rounded-full animate-spin mb-2" />
            Loading inventory...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#9a864c]">No products found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-[#1b180d]">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Product</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Variant</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Stock</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Status</th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-white/80">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece3]">
                {filtered.map((p) =>
                  p.variants?.map((v, vi) => {
                    const stockLevel = v.stock || 0;
                    const isOut = stockLevel <= 0;
                    const isLow = stockLevel > 0 && stockLevel <= 5;

                    return (
                      <tr key={`${p._id}-${v.size}`} className="hover:bg-[#faf8f3] transition-colors duration-150">
                        <td className="px-4 py-3">
                          {vi === 0 ? (
                            <span className="text-[13px] font-semibold text-[#1b180d]">{p.name}</span>
                          ) : (
                            <span className="text-[11px] text-[#9a864c]">↳</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-[#4a4637]">{v.size} ml</td>
                        <td className="px-4 py-3">
                          <span className={`text-[14px] font-bold ${
                            isOut ? "text-red-500" : isLow ? "text-orange-500" : "text-[#1b180d]"
                          }`}>
                            {stockLevel}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {isOut ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-600">
                              <AlertTriangle size={10} /> Out
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-600">
                              Low
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700">
                              In Stock
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setAdjustModal({ productId: p._id, productName: p.name, variantSize: v.size, currentStock: stockLevel })}
                              className="h-7 px-2.5 rounded-lg text-[11px] font-medium border border-[#e7e1cf] hover:bg-[#f5f1e6] hover:border-[#b28c34] transition"
                            >
                              Adjust
                            </button>
                            <button
                              onClick={() => { setShowLogs(true); setLogsProductId(p._id); fetchLogs(p._id); }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#f5f1e6] transition"
                              title="View history"
                            >
                              <History size={13} className="text-[#6b6654]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjust Modal */}
      {adjustModal && (
        <AdjustStockModal
          data={adjustModal}
          onClose={() => setAdjustModal(null)}
          onSuccess={() => { setAdjustModal(null); fetchProducts(); }}
        />
      )}

      {/* Logs Drawer */}
      {showLogs && (
        <LogsDrawer
          logs={logs}
          loading={logsLoading}
          onClose={() => setShowLogs(false)}
        />
      )}
    </div>
  );
}

/* Adjust Stock Modal */
function AdjustStockModal({ data, onClose, onSuccess }) {
  const [adjustment, setAdjustment] = useState("");
  const [type, setType] = useState("RESTOCK");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    const num = Number(adjustment);
    if (!num || num === 0) return toast.error("Enter a valid quantity");

    setSaving(true);
    try {
      const res = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: data.productId,
          variantSize: data.variantSize,
          adjustment: num,
          type,
          reason: reason || undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      toast.success(`Stock updated: ${data.currentStock} → ${json.newStock}`);
      onSuccess();
    } catch (err) {
      toast.error(err.message || "Failed to adjust stock");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5 text-[#1b180d]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold">Adjust Stock</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#f5f1e6]"><X size={16} /></button>
        </div>

        <p className="text-xs text-[#6b6654] mb-4">
          {data.productName} — {data.variantSize} ml · Current stock: <span className="font-bold">{data.currentStock}</span>
        </p>

        {/* Type */}
        <label className="text-[11px] text-[#6b6654] font-medium">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full h-9 border border-[#e7e1cf] rounded-lg px-3 text-xs mb-3 bg-white text-[#1b180d]"
        >
          <option value="RESTOCK">Restock (add)</option>
          <option value="RETURN">Return (add)</option>
          <option value="DAMAGE">Damage (remove)</option>
          <option value="CORRECTION">Correction (+/-)</option>
        </select>

        {/* Quantity */}
        <label className="text-[11px] text-[#6b6654] font-medium">Quantity</label>
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setAdjustment(String(Math.max(0, (Number(adjustment) || 0) - 1)))}
            className="w-9 h-9 flex items-center justify-center border border-[#e7e1cf] rounded-lg hover:bg-[#f5f1e6]"
          >
            <Minus size={14} />
          </button>
          <input
            type="number"
            value={adjustment}
            onChange={(e) => setAdjustment(e.target.value)}
            placeholder="e.g. 20"
            className="flex-1 h-9 border border-[#e7e1cf] rounded-lg px-3 text-sm text-center text-[#1b180d] bg-white"
          />
          <button
            onClick={() => setAdjustment(String((Number(adjustment) || 0) + 1))}
            className="w-9 h-9 flex items-center justify-center border border-[#e7e1cf] rounded-lg hover:bg-[#f5f1e6]"
          >
            <Plus size={14} />
          </button>
        </div>

        <p className="text-[10px] text-[#9a864c] mb-3">
          {type === "DAMAGE"
            ? `New stock: ${data.currentStock} - ${Math.abs(Number(adjustment) || 0)} = ${data.currentStock - Math.abs(Number(adjustment) || 0)}`
            : `New stock: ${data.currentStock} + ${Number(adjustment) || 0} = ${data.currentStock + (Number(adjustment) || 0)}`}
        </p>

        {/* Reason */}
        <label className="text-[11px] text-[#6b6654] font-medium">Reason (optional)</label>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. New shipment from supplier"
          className="w-full h-9 border border-[#e7e1cf] rounded-lg px-3 text-xs mb-4 bg-white text-[#1b180d]"
        />

        <button
          onClick={handleSubmit}
          disabled={saving || !adjustment}
          className="w-full h-9 bg-[#b28c34] text-white rounded-lg text-xs font-semibold hover:bg-[#9a864c] disabled:opacity-60 transition"
        >
          {saving ? "Updating..." : "Update Stock"}
        </button>
      </div>
    </div>
  );
}

/* Logs Drawer */
function LogsDrawer({ logs, loading, onClose }) {
  const typeColors = {
    ORDER_PLACED: "text-red-600 bg-red-50",
    ORDER_CANCELLED: "text-green-600 bg-green-50",
    RESTOCK: "text-blue-600 bg-blue-50",
    RETURN: "text-green-600 bg-green-50",
    DAMAGE: "text-orange-600 bg-orange-50",
    CORRECTION: "text-purple-600 bg-purple-50",
    MANUAL_ADJUST: "text-gray-600 bg-gray-100",
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl border-l border-[#e7e1cf] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e7e1cf]">
          <h3 className="text-sm font-bold text-[#1b180d]">Stock Movement History</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#f5f1e6]"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="text-xs text-[#6b6654] text-center py-8">Loading...</p>
          ) : logs.length === 0 ? (
            <p className="text-xs text-[#9a864c] text-center py-8">No stock movements recorded yet</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log._id} className="border border-[#f0ece3] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${typeColors[log.type] || "text-gray-600 bg-gray-100"}`}>
                      {log.type.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] text-[#9a864c]">
                      {new Date(log.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-[12px] font-medium text-[#1b180d]">
                    {log.productId?.name || "Unknown"} — {log.variantSize} ml
                  </p>
                  <p className="text-[11px] text-[#4a4637]">
                    {log.previousStock} → {log.newStock} ({log.quantity > 0 ? `+${log.quantity}` : log.quantity})
                  </p>
                  {log.reason && (
                    <p className="text-[10px] text-[#6b6654] mt-1 italic">{log.reason}</p>
                  )}
                  <p className="text-[10px] text-[#9a864c] mt-0.5">By: {log.by}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function MiniStat({ label, value, warning }) {
  return (
    <div className={`rounded-xl border p-4 bg-white ${warning ? "border-orange-200" : "border-[#e7e1cf]"}`}>
      <p className={`text-xl font-bold ${warning ? "text-orange-600" : "text-[#1b180d]"}`}>{value}</p>
      <p className="text-[11px] text-[#6b6654]">{label}</p>
    </div>
  );
}
