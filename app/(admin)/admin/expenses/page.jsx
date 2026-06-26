"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Receipt,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const CATEGORIES = [
  "Software/App",
  "Branding/Design",
  "Packaging",
  "Marketing",
  "Shipping",
  "Operations",
  "Other",
];

const PAYMENT_MODES = ["Cash", "UPI", "Bank Transfer", "Card"];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Stats
  const [thisMonthTotal, setThisMonthTotal] = useState(0);
  const [lastMonthTotal, setLastMonthTotal] = useState(0);
  const [allTimeTotal, setAllTimeTotal] = useState(0);

  // Filters
  const [filterCategory, setFilterCategory] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    category: "Operations",
    description: "",
    amount: "",
    payment_mode: "UPI",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Trend chart data
  const [trendData, setTrendData] = useState([]);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (filterCategory) params.set("category", filterCategory);
      if (filterFrom) params.set("from", filterFrom);
      if (filterTo) params.set("to", filterTo);

      const res = await fetch(`/api/admin/expenses?${params}`);
      const data = await res.json();
      if (data.success) {
        setExpenses(data.expenses || []);
        setTotal(data.total || 0);
        setTotalPages(data.pages || 1);
      }
    } catch (e) {
      console.error("Failed to fetch expenses:", e);
    } finally {
      setLoading(false);
    }
  }, [page, filterCategory, filterFrom, filterTo]);

  const fetchStats = useCallback(async () => {
    try {
      const now = new Date();
      // Use local date formatting to avoid UTC day shift
      const pad = (n) => String(n).padStart(2, "0");
      const toLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

      const startOfMonth = toLocal(new Date(now.getFullYear(), now.getMonth(), 1));
      const startOfLastMonth = toLocal(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      const endOfLastMonth = toLocal(new Date(now.getFullYear(), now.getMonth(), 0));

      const [thisMonthRes, lastMonthRes, allTimeRes] = await Promise.all([
        fetch(`/api/admin/expenses?from=${startOfMonth}&limit=1`),
        fetch(`/api/admin/expenses?from=${startOfLastMonth}&to=${endOfLastMonth}&limit=1`),
        fetch(`/api/admin/expenses?limit=1`),
      ]);

      const [thisMonth, lastMonth, allTime] = await Promise.all([
        thisMonthRes.json(),
        lastMonthRes.json(),
        allTimeRes.json(),
      ]);

      setThisMonthTotal(thisMonth.totalAmount || 0);
      setLastMonthTotal(lastMonth.totalAmount || 0);
      setAllTimeTotal(allTime.totalAmount || 0);
    } catch (e) {
      console.error("Failed to fetch stats:", e);
    }
  }, []);

  const fetchTrend = useCallback(async () => {
    try {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const toLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = toLocal(d);
        const end = toLocal(new Date(d.getFullYear(), d.getMonth() + 1, 0));
        months.push({
          label: d.toLocaleDateString("en-IN", { month: "short" }),
          from: start,
          to: end,
        });
      }

      const results = await Promise.all(
        months.map((m) =>
          fetch(`/api/admin/expenses?from=${m.from}&to=${m.to}&limit=1`).then((r) => r.json())
        )
      );

      setTrendData(
        months.map((m, i) => ({
          label: m.label,
          amount: results[i]?.totalAmount || 0,
        }))
      );
    } catch (e) {
      console.error("Failed to fetch trend:", e);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    fetchStats();
    fetchTrend();
  }, [fetchStats, fetchTrend]);

  function openAddModal() {
    setEditingExpense(null);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      category: "Operations",
      description: "",
      amount: "",
      payment_mode: "UPI",
      notes: "",
    });
    setFormErrors([]);
    setShowModal(true);
  }

  function openEditModal(expense) {
    setEditingExpense(expense);
    setFormData({
      date: new Date(expense.date).toISOString().split("T")[0],
      category: expense.category,
      description: expense.description,
      amount: String(expense.amount),
      payment_mode: expense.payment_mode || "UPI",
      notes: expense.notes || "",
    });
    setFormErrors([]);
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setFormErrors([]);

    try {
      const url = editingExpense
        ? `/api/admin/expenses/${editingExpense._id}`
        : "/api/admin/expenses";
      const method = editingExpense ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchExpenses();
        fetchStats();
        fetchTrend();
      } else {
        setFormErrors(data.errors || [data.error || "Something went wrong"]);
      }
    } catch (err) {
      setFormErrors(["Network error"]);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/expenses/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDeleteTarget(null);
        fetchExpenses();
        fetchStats();
        fetchTrend();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  }

  function clearFilters() {
    setFilterCategory("");
    setFilterFrom("");
    setFilterTo("");
    setPage(1);
  }

  const maxTrend = Math.max(...trendData.map((d) => d.amount), 1);

  return (
    <div className="min-h-[70vh] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1b180d]">Expenses</h1>
          <p className="text-sm text-[#6b6654]">
            Track and manage all business expenses
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#1b180d] text-white rounded-lg hover:bg-[#2d2a20]"
        >
          <Plus size={16} />
          Add Expense
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="This Month" value={thisMonthTotal} />
        <StatCard label="Last Month" value={lastMonthTotal} />
        <StatCard label="All Time" value={allTimeTotal} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
          className="h-9 px-3 text-sm border border-[#e7e1cf] rounded-lg bg-white text-[#1b180d]"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          type="date"
          value={filterFrom}
          onChange={(e) => { setFilterFrom(e.target.value); setPage(1); }}
          className="h-9 px-3 text-sm border border-[#e7e1cf] rounded-lg bg-white text-[#1b180d]"
          placeholder="From"
        />
        <input
          type="date"
          value={filterTo}
          onChange={(e) => { setFilterTo(e.target.value); setPage(1); }}
          className="h-9 px-3 text-sm border border-[#e7e1cf] rounded-lg bg-white text-[#1b180d]"
          placeholder="To"
        />
        {(filterCategory || filterFrom || filterTo) && (
          <button
            onClick={clearFilters}
            className="h-9 px-3 text-sm border border-[#e7e1cf] rounded-lg hover:bg-[#f5f1e6] text-[#6b6654]"
          >
            Clear
          </button>
        )}
      </div>

      {/* Expense Trend Chart */}
      {trendData.length > 0 && (
        <div className="rounded-xl border border-[#e7e1cf] p-5 bg-white shadow-sm">
          <h3 className="text-sm font-bold text-[#1b180d] mb-4">Expense Trend (Last 6 Months)</h3>
          <div className="h-40">
            <svg viewBox="0 0 600 160" className="w-full h-full">
              {trendData.map((d, i) => {
                const barWidth = 600 / trendData.length;
                const barHeight = (d.amount / maxTrend) * 110;
                const x = i * barWidth + 20;
                const y = 130 - barHeight;

                return (
                  <g key={i}>
                    <rect
                      x={x}
                      y={y}
                      width={Math.max(barWidth - 30, 30)}
                      height={barHeight}
                      fill="#b28c34"
                      rx="4"
                    />
                    <text
                      x={x + (barWidth - 30) / 2}
                      y={150}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#6b6654"
                    >
                      {d.label}
                    </text>
                    {d.amount > 0 && (
                      <text
                        x={x + (barWidth - 30) / 2}
                        y={y - 5}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#1b180d"
                      >
                        ₹{d.amount.toLocaleString("en-IN")}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* Expense Table */}
      <div className="rounded-xl border border-[#e7e1cf] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1b180d] text-white">
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">Description</th>
                <th className="text-right px-4 py-3 font-medium">Amount</th>
                <th className="text-left px-4 py-3 font-medium">Mode</th>
                <th className="text-center px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-[#6b6654]">
                    Loading...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-[#6b6654]">
                    No expenses found
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense._id} className="border-t border-[#e7e1cf] hover:bg-[#fcfbf8]">
                    <td className="px-4 py-3 text-[#1b180d]">
                      {new Date(expense.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-[#fff9ee] text-[#b28c34] font-medium">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#1b180d] max-w-[200px] truncate">
                      {expense.description}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[#1b180d]">
                      ₹{Number(expense.amount).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-[#6b6654]">{expense.payment_mode}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(expense)}
                          aria-label="Edit expense"
                          title="Edit"
                          className="p-1.5 rounded-md hover:bg-[#f5f1e6] text-[#6b6654] hover:text-[#b28c34]"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(expense)}
                          aria-label="Delete expense"
                          title="Delete"
                          className="p-1.5 rounded-md hover:bg-red-50 text-[#6b6654] hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#e7e1cf]">
            <p className="text-xs text-[#6b6654]">
              Page {page} of {totalPages} ({total} total)
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-md border border-[#e7e1cf] hover:bg-[#f5f1e6] disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-md border border-[#e7e1cf] hover:bg-[#f5f1e6] disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1b180d]">
                {editingExpense ? "Edit Expense" : "Add Expense"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                aria-label="Close modal"
                className="p-1 rounded-md hover:bg-[#f5f1e6]"
              >
                <X size={18} className="text-[#6b6654]" />
              </button>
            </div>

            {formErrors.length > 0 && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                {formErrors.map((err, i) => (
                  <p key={i} className="text-xs text-red-600">{err}</p>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#1b180d] mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full h-9 px-3 text-sm border border-[#e7e1cf] rounded-lg bg-white text-[#1b180d]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1b180d] mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-9 px-3 text-sm border border-[#e7e1cf] rounded-lg bg-white text-[#1b180d]"
                  required
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1b180d] mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full h-9 px-3 text-sm border border-[#e7e1cf] rounded-lg bg-white text-[#1b180d]"
                  placeholder="What was this expense for?"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1b180d] mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full h-9 px-3 text-sm border border-[#e7e1cf] rounded-lg bg-white text-[#1b180d]"
                  placeholder="0"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1b180d] mb-1">Payment Mode</label>
                <select
                  value={formData.payment_mode}
                  onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                  className="w-full h-9 px-3 text-sm border border-[#e7e1cf] rounded-lg bg-white text-[#1b180d]"
                >
                  {PAYMENT_MODES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1b180d] mb-1">Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#e7e1cf] rounded-lg bg-white text-[#1b180d] resize-none"
                  rows={3}
                  placeholder="Any additional notes..."
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full h-10 text-sm font-semibold rounded-lg bg-[#b28c34] text-white hover:bg-[#9a864c] disabled:opacity-60"
              >
                {saving ? "Saving..." : editingExpense ? "Update Expense" : "Add Expense"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-bold text-[#1b180d] mb-2">Delete Expense</h2>
            <p className="text-sm text-[#6b6654] mb-4">
              Are you sure you want to delete &quot;{deleteTarget.description}&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 h-9 text-sm border border-[#e7e1cf] rounded-lg hover:bg-[#f5f1e6] text-[#1b180d]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-9 text-sm font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-[#e7e1cf] p-5 bg-white shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#fff9ee] flex items-center justify-center">
          <Receipt size={18} className="text-[#b28c34]" />
        </div>
        <div>
          <p className="text-xl font-bold text-[#1b180d]">
            ₹{Number(value || 0).toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-[#9a864c]">{label}</p>
        </div>
      </div>
    </div>
  );
}
