"use client";

import { useEffect, useState, useRef } from "react";
import OrderRow from "../components/OrderRow";
import {
  Search,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Download,
  Calendar as CalendarIcon,
} from "lucide-react";

import { DateRange } from "react-date-range";
import { addDays, format } from "date-fns";
import CreateOrderModal from "./components/CreateOrderModal";

// react-date-range CSS (required)
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

/**
 * OrdersClient.jsx
 * Upgraded filters:
 * - Payment & Order status dropdown (styled)
 * - Single "Date Range" button opens a popup containing react-date-range (two-month calendars)
 * - Compact, premium spacing and slightly bigger fonts
 * - Pagination with smart collapse and unique keys
 * - Export CSV, search & apply filters
 */

export default function OrdersClient() {
  // filters
  const paymentRef = useRef(null);
  const orderRef = useRef(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [q, setQ] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [productName, setProductName] = useState("");
  const [hasDiscount, setHasDiscount] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [uniqueProducts, setUniqueProducts] = useState([]);
  const didInitProducts = useRef(false);

  // date range picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [range, setRange] = useState({
    startDate: addDays(new Date(), -30),
    endDate: new Date(),
    key: "selection",
  });

  // data + meta
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 25, total: 0, pages: 1 });

  const pickerRef = useRef(null);

  // common fetch wrapper
  const fetchOrders = async (page = 1, deletedMode = showDeleted) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", meta.limit ?? 10);

      if (deletedMode) params.set("deleted", "true");
      if (q) params.set("q", q);
      if (paymentStatus) params.set("paymentStatus", paymentStatus);
      if (orderStatus) params.set("orderStatus", orderStatus);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (productName) params.set("productName", productName);
      if (hasDiscount) params.set("hasDiscount", hasDiscount);


      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const json = await res.json();
      if (res.ok) {
        setOrders(json.data || []);
        setMeta(json.meta || { page, limit: meta.limit, total: 0, pages: 1 });
      } else {
        console.error("fetchOrders error:", json);
      }
    } catch (err) {
      console.error("Failed:", err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
  if (!didInitProducts.current && orders.length > 0) {
    const names = new Set();

    orders.forEach((order) => {
      order.cartItems?.forEach((item) => {
        if (item.name) names.add(item.name);
      });
    });

    setUniqueProducts([...names]);
    didInitProducts.current = true;
  }
}, [orders]);

useEffect(() => {
  if (productName !== "") {
    fetchOrders(1);
  }
}, [productName]);

  // initial load
  useEffect(() => {
    // Initial load → NO date filter
    fetchOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // close date picker on outside click
  useEffect(() => {
    function onDoc(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
    }
    if (showDatePicker) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [showDatePicker]);

  useEffect(() => {
    const handleClickOutside = (e) => {
        if (paymentRef.current && !paymentRef.current.contains(e.target)) {
        setShowPayment(false);
        }
        if (orderRef.current && !orderRef.current.contains(e.target)) {
        setShowOrder(false);
        }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

  const applyFilters = () => {
    // ensure meta.page reset to 1
    fetchOrders(1);
  };

  const changePage = (p) => {
    setMeta((m) => ({ ...m, page: p }));
    fetchOrders(p);
  };

  // pagination builder (smart collapse)
  const buildPages = () => {
    const pages = [];
    const total = meta.pages;
    const current = meta.page;

    if (!total || total <= 8) {
      for (let i = 1; i <= (total || 1); i++) pages.push(i);
      return pages;
    }

    pages.push(1, 2);

    if (current > 4) pages.push("left-dots");

    for (let p = current - 1; p <= current + 1; p++) {
      if (p > 2 && p < total - 1) pages.push(p);
    }

    if (current < total - 3) pages.push("right-dots");

    pages.push(total - 1, total);

    // dedupe while preserving order
    return pages.filter((v, i, a) => a.indexOf(v) === i);
  };

  // export CSV
const exportCSV = async () => {
  try {
    const params = new URLSearchParams();

    if (q) params.set("q", q);
    if (paymentStatus) params.set("paymentStatus", paymentStatus);
    if (orderStatus) params.set("orderStatus", orderStatus);
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    // fetch all filtered data (no pagination)
    const res = await fetch(`/api/admin/orders/export?${params.toString()}`);
    const json = await res.json();

    if (!res.ok) {
      console.error(json);
      alert("Failed to export CSV");
      return;
    }

    const all = json.data || [];
    if (!all.length) return alert("No data to export.");

    const rows = [
      [
        "Order ID",
        "Customer",
        "Email",
        "Phone",
        "Date",
        "Total Amount",
        "Payment Status",
        "Order Status",
        "Guest/User",
      ],
      ...all.map((o) => [
        o.customOrderId || o._id,
        o.userName || "",
        o.email || "",
        o.phone || "",
        new Date(o.createdAt).toLocaleString("en-IN"),
        Number(o.totalAmount || 0).toLocaleString("en-IN"),
        o.status || "",
        o.order_status || "",
        (o.userId?.isGuest === true ? "Guest" : "Logged-In"),
      ]),
    ];

    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "all-orders.csv";
    a.click();
  } catch (e) {
    console.error(e);
    alert("Error during export.");
  }
};

  // handle date range change from react-date-range
  const onRangeChange = (ranges) => {
    const sel = ranges.selection;
    setRange(sel);
    const s = format(sel.startDate, "yyyy-MM-dd");
    const e = format(sel.endDate, "yyyy-MM-dd");
    setFrom(s);
    setTo(e);
  };

  // small helper: nice label for date button
  const dateLabel = () => {
    if (!from || !to) return "Date range";
    const s = format(new Date(from), "dd MMM");
    const e = format(new Date(to), "dd MMM");
    return `${s} - ${e}`;
  };

  const resetAfterStatusUpdate = () => {
  fetchOrders(meta.page);
};

{showCreateOrder && (
  <CreateOrderModal
    onClose={() => setShowCreateOrder(false)}
    onCreated={() => fetchOrders(1)}
  />
)}

  return (
    <div className="space-y-6">

      {/* SEARCH + FILTERS */}
      <div className="space-y-3">

        {/* Search Bar */}
        <div className="flex items-center gap-2 w-full rounded-xl border border-[#e7e1cf] bg-white px-4 h-11">
          <Search size={18} className="text-[#9a864c] shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchOrders(1)}
            placeholder="Search by Order ID, customer, or product..."
            className="flex-1 bg-transparent outline-none text-sm text-[#1b180d] placeholder:text-[#9a864c]"
          />
          <button
            onClick={() => fetchOrders(1)}
            className="px-3 py-1.5 bg-[#b28c34] text-white text-xs font-semibold rounded-lg hover:bg-[#9a864c] transition shrink-0"
          >
            Search
          </button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2">

          {/* Payment Status */}
          <div className="relative" ref={paymentRef}>
            <button
              onClick={() => setShowPayment((v) => !v)}
              className="h-9 px-3 rounded-lg border border-[#e7e1cf] bg-white text-xs text-[#1b180d] flex items-center gap-2 hover:border-[#b28c34] transition"
            >
              {paymentStatus ? paymentStatus.charAt(0) + paymentStatus.slice(1).toLowerCase() : "Payment Status"}
              <ChevronDown size={14} className={`text-[#b28c34] transition-transform ${showPayment ? "rotate-180" : ""}`} />
            </button>

            {showPayment && (
              <div className="absolute mt-1 w-36 bg-white border border-[#e7e1cf] rounded-lg shadow-lg z-20">
                {["ALL", "PAID", "PENDING", "FAILED", "CANCELLED"].map((s) => (
                  <div
                    key={s}
                    onClick={() => { setPaymentStatus(s === "ALL" ? "" : s); setShowPayment(false); }}
                    className={`px-3 py-2 text-xs cursor-pointer hover:bg-[#f5f1e6] ${paymentStatus === s ? "bg-[#f5f1e6] font-semibold" : ""}`}
                  >
                    {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Status */}
          <div className="relative" ref={orderRef}>
            <button
              onClick={() => setShowOrder((v) => !v)}
              className="h-9 px-3 rounded-lg border border-[#e7e1cf] bg-white text-xs text-[#1b180d] flex items-center gap-2 hover:border-[#b28c34] transition"
            >
              {orderStatus || "Order Status"}
              <ChevronDown size={14} className={`text-[#b28c34] transition-transform ${showOrder ? "rotate-180" : ""}`} />
            </button>

            {showOrder && (
              <div className="absolute mt-1 w-40 bg-white border border-[#e7e1cf] rounded-lg shadow-lg z-20">
                {["ALL", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"].map((s) => (
                  <div
                    key={s}
                    onClick={() => { setOrderStatus(s === "ALL" ? "" : s); setShowOrder(false); }}
                    className={`px-3 py-2 text-xs cursor-pointer hover:bg-[#f5f1e6] ${orderStatus === s ? "bg-[#f5f1e6] font-semibold" : ""}`}
                  >
                    {s === "ALL" ? "All" : s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="relative" ref={pickerRef}>
            <button
              onClick={() => setShowDatePicker((v) => !v)}
              className="h-9 px-3 rounded-lg border border-[#e7e1cf] bg-white text-xs text-[#1b180d] flex items-center gap-2 hover:border-[#b28c34] transition"
            >
              {dateLabel()}
              <CalendarIcon size={14} className="text-[#b28c34]" />
            </button>

            {showDatePicker && (
              <div className="absolute mt-1 z-30 bg-white border border-[#e7e1cf] rounded-xl shadow-xl">
                <DateRange
                  ranges={[range]}
                  onChange={onRangeChange}
                  moveRangeOnFirstSelection={false}
                  editableDateInputs={true}
                  months={2}
                  direction="horizontal"
                  rangeColors={["#b28c34"]}
                  className="text-[#1b180d]"
                />
                <div className="flex justify-end p-2.5 border-t border-[#e7e1cf]">
                  <button
                    onClick={() => { setShowDatePicker(false); applyFilters(); }}
                    className="px-3 py-1.5 bg-[#b28c34] text-white rounded-lg text-xs font-semibold hover:bg-[#9a864c]"
                  >
                    Apply Date
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Product Filter */}
          <select
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="h-9 px-3 rounded-lg border border-[#e7e1cf] bg-white text-xs text-[#1b180d]"
          >
            <option value="">All Products</option>
            {uniqueProducts.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Discount Filter */}
          <select
            value={hasDiscount}
            onChange={(e) => setHasDiscount(e.target.value)}
            className="h-9 px-3 rounded-lg border border-[#e7e1cf] bg-white text-xs text-[#1b180d]"
          >
            <option value="">Discount</option>
            <option value="yes">With Discount</option>
            <option value="no">No Discount</option>
          </select>

          {/* Apply */}
          <button
            onClick={applyFilters}
            className="h-9 px-4 bg-[#b28c34] text-white rounded-lg text-xs font-semibold hover:bg-[#9a864c] transition"
          >
            Apply
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Active/Deleted Toggle */}
          <button
            onClick={() => {
              const next = !showDeleted;
              setShowDeleted(next);
              setFrom(""); setTo(""); setQ(""); setPaymentStatus(""); setOrderStatus("");
              fetchOrders(1, next);
            }}
            className={`h-9 px-3 rounded-lg text-xs font-semibold border transition ${
              showDeleted
                ? "bg-red-50 text-red-600 border-red-200"
                : "bg-white text-[#1b180d] border-[#e7e1cf] hover:border-[#b28c34]"
            }`}
          >
            {showDeleted ? "Deleted" : "Active"}
          </button>

          {/* Create */}
          <button
            onClick={() => setShowCreateOrder(true)}
            className="h-9 px-3 rounded-lg text-xs font-semibold bg-[#1b180d] text-white hover:bg-[#2a2618] transition"
          >
            + Create
          </button>

          {/* Export */}
          <button
            onClick={exportCSV}
            className="h-9 px-3 rounded-lg text-xs font-semibold border border-[#e7e1cf] bg-white text-[#1b180d] hover:bg-[#f5f1e6] flex items-center gap-1.5 transition"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-xl border border-[#e7e1cf] overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[950px] w-full">
            <thead>
              <tr className="bg-[#1b180d]">
                <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Order ID</th>
                <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Customer</th>
                <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Date</th>
                <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Amount</th>
                <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Payment</th>
                <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Status</th>
                {showDeleted && (
                  <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Reason</th>
                )}
                <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Actions</th>
                <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Discount</th>
                <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Coupon</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#f0ece3]">
              {loading ? (
                <tr>
                  <td colSpan={showDeleted ? 10 : 9} className="text-center py-16 text-sm text-[#6b6654]">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#b28c34] border-t-transparent rounded-full animate-spin" />
                      <span>Loading orders...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length ? (
                orders.map((o) => (
                  <OrderRow
                    key={o._id}
                    order={o}
                    showDeleted={showDeleted}
                    onStatusUpdated={resetAfterStatusUpdate}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={showDeleted ? 10 : 9} className="text-center py-16 text-sm text-[#9a864c]">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <p className="text-[#6b6654]">
          Showing <span className="font-semibold text-[#1b180d]">{(meta.page - 1) * meta.limit + 1}</span> to{" "}
          <span className="font-semibold text-[#1b180d]">{Math.min(meta.page * meta.limit, meta.total)}</span> of{" "}
          <span className="font-semibold text-[#1b180d]">{meta.total}</span> orders
        </p>

        <div className="flex items-center gap-1">
          <button
            disabled={meta.page === 1}
            onClick={() => fetchOrders(meta.page - 1)}
            className="w-8 h-8 flex items-center justify-center border border-[#e7e1cf] rounded-lg hover:bg-[#f5f1e6] disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={14} />
          </button>

          {buildPages().map((p, i) =>
            p === "left-dots" || p === "right-dots" ? (
              <span key={`dots-${p}-${i}`} className="px-1.5 text-[#9a864c]">
                …
              </span>
            ) : (
              <button
                key={`page-${p}-${i}`}
                onClick={() => fetchOrders(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                  p === meta.page
                    ? "bg-[#b28c34] text-white shadow-sm"
                    : "hover:bg-[#f5f1e6] text-[#1b180d]"
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            disabled={meta.page === meta.pages}
            onClick={() => fetchOrders(meta.page + 1)}
            className="w-8 h-8 flex items-center justify-center border border-[#e7e1cf] rounded-lg hover:bg-[#f5f1e6] disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {showCreateOrder && (
          <CreateOrderModal
            onClose={() => setShowCreateOrder(false)}
            onCreated={() => fetchOrders(1)}
          />
        )}
      </div>
    </div>
  );
}

<style jsx>{`
  @media (max-width: 768px) {
    table {
      font-size: 12px;
    }
    th, td {
      padding: 8px !important;
    }
  }
`}</style>
