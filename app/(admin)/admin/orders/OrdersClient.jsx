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
  const [couponCode, setCouponCode] = useState("");
  const [hasDiscount, setHasDiscount] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);


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
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

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
      if (couponCode) params.set("couponCode", couponCode);
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
    return `${s} — ${e}`;
  };

  const resetAfterStatusUpdate = () => {
  setOrderStatus("");
  fetchOrders(1);
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
      <div className="flex flex-col gap-4">

        {/* ⭐ SEARCH + FILTERS (PREMIUM RAVEN THEME) */}
<div className="flex flex-col gap-4">

  {/* 🔍 SEARCH BAR */}
  <div className="flex items-center w-full rounded-lg border border-[#e7e1cf] bg-[#fcfbf8] px-4 py-2">
    <Search size={20} className="text-[#b28c34]" />
    <input
      value={q}
      onChange={(e) => setQ(e.target.value)}
      placeholder="Search by Order ID, customer, or product..."
      className="ml-3 w-full bg-transparent outline-none text-[15px] text-[#1b180d]"
    />
    {/* Search Button */}
    <button
      onClick={() => fetchOrders(1)}
      className="ml-3 px-4 py-2 bg-[#b28c34] text-white text-sm font-semibold rounded-lg hover:bg-[#9a864c] transition"
    >
      Search
    </button>
  </div>

  {/* 🔽 FILTER ROW */}
  <div className="flex flex-wrap items-center justify-between gap-3">

    <div className="flex flex-wrap gap-3 items-center">
     
     {/* PAYMENT STATUS DROPDOWN */}
        <div className="relative" ref={paymentRef}>
        <button
            onClick={() => setShowPayment((v) => !v)}
            className="
            h-10 px-4 rounded-lg border border-[#e7e1cf]
            bg-[#fcfbf8] text-[14px] text-[#1b180d]
            flex items-center justify-between gap-2 min-w-[150px]
            hover:border-[#b28c34] transition
            "
        >
            {paymentStatus === ""
            ? "Payment Status"
            : paymentStatus === "ALL"
            ? "All"
            : paymentStatus.charAt(0) + paymentStatus.slice(1).toLowerCase()}
            
            <ChevronDown
            size={16}
            className={`text-[#b28c34] transition-transform ${
                showPayment ? "rotate-180" : ""
            }`}
            />
        </button>

        {showPayment && (
            <div
            className="
                absolute mt-2 w-40 bg-white border border-[#e7e1cf]
                rounded-lg shadow-lg z-20
            "
            >
            {["ALL", "PAID", "PENDING", "FAILED", "CANCELLED"].map((s) => (
                <div
                key={s}
                onClick={() => {
                    setPaymentStatus(s === "ALL" ? "" : s);
                    setShowPayment(false);
                }}
                className={`
                    px-4 py-2 text-[14px] cursor-pointer 
                    hover:bg-[#f3efe6]
                    ${paymentStatus === s ? "bg-[#f8f4eb] font-medium" : ""}
                `}
                >
                {s === "ALL"
                    ? "All"
                    : s.charAt(0) + s.slice(1).toLowerCase()}
                </div>
            ))}
            </div>
        )}
        </div>


      {/* ORDER STATUS DROPDOWN */}
        <div className="relative" ref={orderRef}>
        <button
            onClick={() => setShowOrder((v) => !v)}
            className="
            h-10 px-4 rounded-lg border border-[#e7e1cf]
            bg-[#fcfbf8] text-[14px] text-[#1b180d]
            flex items-center justify-between gap-2 min-w-40
            hover:border-[#b28c34] transition
            "
        >
            {orderStatus === ""
            ? "Order Status"
            : orderStatus === "ALL"
            ? "All"
            : orderStatus}

            <ChevronDown
            size={16}
            className={`text-[#b28c34] transition-transform ${
                showOrder ? "rotate-180" : ""
            }`}
            />
        </button>

        {showOrder && (
            <div
            className="
                absolute mt-2 w-44 bg-white border border-[#e7e1cf]
                rounded-lg shadow-lg z-20
            "
            >
            {[
                "ALL",
                "Processing",
                "Out for Delivery",
                "Shipped",
                "Delivered",
                "Cancelled",
            ].map((s) => (
                <div
                key={s}
                onClick={() => {
                    setOrderStatus(s === "ALL" ? "" : s);
                    setShowOrder(false);
                }}
                className={`
                    px-4 py-2 text-[14px] cursor-pointer 
                    hover:bg-[#f5f1e6]
                    ${orderStatus === s ? "bg-[#f8f4eb] font-medium" : ""}
                `}
                >
                {s === "ALL" ? "All" : s}
                </div>
            ))}
            </div>
        )}
        </div>

    {/* DATE RANGE DROPDOWN */}
<div className="relative" ref={pickerRef}>
  <button
    onClick={() => setShowDatePicker((v) => !v)}
    className="
      h-10 px-4 rounded-lg border border-[#e7e1cf]
      bg-[#fcfbf8] text-[14px] text-[#1b180d]
      flex items-center justify-between gap-2 min-w-[165px]
      hover:border-[#b28c34] transition
    "
  >
    {dateLabel()}
    <CalendarIcon size={16} className="text-[#b28c34]" />
  </button>

  {showDatePicker && (
    <div
      ref={pickerRef}
      className="
        absolute mt-2 z-30 bg-white border border-[#e7e1cf] rounded-lg shadow-xl
      "
    >
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

      {/* APPLY BUTTON */}
      <div className="flex justify-end p-3 border-t border-[#e7e1cf] bg-[#fcfbf8]">
        <button
          onClick={() => {
            setShowDatePicker(false);
            applyFilters();
          }}
          className="px-4 py-2 bg-[#b28c34] text-white rounded-lg text-sm hover:bg-[#9a864c]"
        >
          Apply Date
        </button>
      </div>
    </div>
  )}
</div>
      
      {/* COUPON FILTER */}
<input
  value={couponCode}
  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
  placeholder="Coupon Code"
  className="h-10 px-3 rounded-lg border border-[#e7e1cf] bg-[#fcfbf8] text-[14px]"
/>

{/* DISCOUNT FILTER */}
<select
  value={hasDiscount}
  onChange={(e) => setHasDiscount(e.target.value)}
  className="h-10 px-3 rounded-lg border border-[#e7e1cf] bg-[#fcfbf8] text-[14px]"
>
  <option value="">Discount Filter</option>
  <option value="yes">With Discount</option>
  <option value="no">No Discount</option>
</select>

      {/* Apply Button */}
      <button
        onClick={applyFilters}
        className="h-10 px-4 bg-[#b28c34] text-white rounded-lg text-sm font-semibold hover:bg-[#9a864c] transition"
      >
        Apply
      </button>
    </div>

    <div className="flex flex-wrap items-center gap-3 justify-end">
      {/* 🗂 Active / Deleted Toggle */}
      <button
        onClick={() => {
          const next = !showDeleted;
          setShowDeleted(next);

          setFrom("");
          setTo("");
          setQ("");
          setPaymentStatus("");
          setOrderStatus("");

          fetchOrders(1, next);
        }}
        className={`
          h-10 px-4 rounded-lg text-sm font-semibold border transition
          ${
            showDeleted
              ? "bg-[#f5f1e6] text-[#1b180d] border-[#b28c34]"
              : "bg-[#fcfbf8] text-[#1b180d] border-[#e7e1cf] hover:border-[#b28c34]"
          }
        `}
      >
        {showDeleted ? "Deleted Orders" : "Active Orders"}
      </button>

      {/* ➕ Create Order */}
      <button
        onClick={() => setShowCreateOrder(true)}
        className="
          h-10 px-4 rounded-lg text-sm font-semibold
          bg-[#1b180d] text-white hover:bg-[#2a2618]
          transition
        "
      >
        + Create
      </button>

      {/* ⬇️ Export */}
      <button
        onClick={exportCSV}
        className="
          h-10 px-4 rounded-lg text-sm font-semibold border
          border-[#e7e1cf] text-[#1b180d]
          bg-[#fcfbf8] hover:bg-[#f5f1e6]
          flex items-center gap-2 transition
        "
      >
        <Download size={16} />
        Export
      </button>
    </div>

  </div>
</div>

      </div>

      {/* TABLE WRAPPER for mobile horizontal scroll */}
      <div className="rounded-lg border border-[#e7e1cf] bg-white overflow-x-auto w-full">
        <table className="min-w-[900px] w-full text-[15px]">
          <thead className="bg-[#fcfbf8] text-[12px] uppercase text-[#1b180d]/60">
            <tr>
              <th className="px-6 py-4 text-left min-w-[120px]">Order ID</th>
              <th className="px-6 py-4 text-left min-w-[170px]">Customer</th>
              <th className="px-6 py-4 text-left min-w-[170px]">Date</th>
              <th className="px-6 py-4 text-left min-w-[120px]">Amount</th>
              <th className="px-6 py-4 text-left min-w-[120px]">Discount</th>
              <th className="px-6 py-4 text-left min-w-[150px]">Coupon</th>
              <th className="px-6 py-4 text-left min-w-[120px]">Payment</th>
              <th className="px-6 py-4 text-left min-w-40">Status</th>
              {showDeleted && (
                <th className="px-6 py-4 text-left min-w-[200px]">Delete Reason</th>
              )}
              <th className="px-6 py-4 text-left min-w-[120px]">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-sm">
                  Loading...
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
                <td colSpan={7} className="text-center py-6 text-sm text-gray-500">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-[#1b180d]/60">
          Showing{" "}
          <span className="font-semibold">{(meta.page - 1) * meta.limit + 1}</span> to{" "}
          <span className="font-semibold">{Math.min(meta.page * meta.limit, meta.total)}</span> of{" "}
          <span className="font-semibold">{meta.total}</span> results
        </p>

        <div className="flex items-center gap-1">
          <button
            disabled={meta.page === 1}
            onClick={() => fetchOrders(meta.page - 1)}
            className="w-9 h-9 flex items-center justify-center border border-[#e7e1cf] rounded-lg"
          >
            <ChevronLeft size={16} />
          </button>

          {buildPages().map((p, i) =>
            p === "left-dots" || p === "right-dots" ? (
              <span key={`dots-${p}-${i}`} className="px-2">
                …
              </span>
            ) : (
              <button
                key={`page-${p}-${i}`}
                onClick={() => fetchOrders(p)}
                className={`w-9 h-9 rounded-lg ${p === meta.page ? "bg-[#b28c34] text-white" : "hover:bg-[#e7e1cf]"}`}
              >
                {p}
              </button>
            )
          )}

          <button
            disabled={meta.page === meta.pages}
            onClick={() => fetchOrders(meta.page + 1)}
            className="w-9 h-9 flex items-center justify-center border border-[#e7e1cf] rounded-lg"
          >
            <ChevronRight size={16} />
          </button>

          {showCreateOrder && (
  <CreateOrderModal
    onClose={() => setShowCreateOrder(false)}
    onCreated={() => fetchOrders(1)}
  />
)}

        </div>
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
