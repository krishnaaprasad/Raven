"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, Calendar, ChevronDown, X, Users, UserPlus, Activity, Phone } from "lucide-react";

const PAGE_SIZE = 10;

export default function CustomersClient() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers30: 0,
    activeToday: 0,
  });

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  const [statusOpen, setStatusOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          search,
          status,
          dateRange,
        });

        const res = await fetch(`/api/admin/customers?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Error");

        setUsers(data.users || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
        setStats({
          totalUsers: data.stats?.totalUsers || 0,
          newUsers30: data.stats?.newUsers30 || 0,
          activeToday: data.stats?.activeToday || 0,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Failed to load customers:", err);
        }
      }
    }

    load();
    return () => controller.abort();
  }, [page, search, status, dateRange]);

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setDateRange("all");
    setPage(1);
  };

  const showingFrom = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-5">

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard icon={<Users size={18} />} label="Total Customers" value={stats.totalUsers} />
        <StatCard icon={<UserPlus size={18} />} label="New (Last 30 days)" value={stats.newUsers30} />
        <StatCard icon={<Activity size={18} />} label="Active Today" value={stats.activeToday} />
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="flex items-center flex-1 min-w-[200px] max-w-md h-9 rounded-lg border border-[#e7e1cf] bg-white px-3">
          <Search size={15} className="text-[#9a864c] shrink-0" />
          <input
            className="flex-1 ml-2 text-xs outline-none bg-transparent text-[#1b180d] placeholder:text-[#9a864c]"
            placeholder="Search by name, phone, or email..."
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          />
          {search && (
            <button onClick={() => { setSearch(""); setPage(1); }}>
              <X size={14} className="text-[#6b6654]" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="relative">
          <button
            onClick={() => setStatusOpen((o) => !o)}
            className="h-9 px-3 rounded-lg border border-[#e7e1cf] bg-white text-xs flex items-center gap-2 hover:border-[#b28c34] transition"
          >
            <Filter size={13} />
            {status === "all" ? "All Status" : status === "active" ? "Active" : "Banned"}
            <ChevronDown size={12} className={`text-[#b28c34] transition-transform ${statusOpen ? "rotate-180" : ""}`} />
          </button>

          {statusOpen && (
            <div className="absolute mt-1 w-32 rounded-lg border border-[#e7e1cf] bg-white shadow-lg z-20">
              {[{ val: "all", label: "All" }, { val: "active", label: "Active" }, { val: "banned", label: "Banned" }].map((o) => (
                <button
                  key={o.val}
                  onClick={() => { setStatus(o.val); setPage(1); setStatusOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-[#f5f1e6] ${status === o.val ? "font-semibold bg-[#f5f1e6]" : ""}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date Filter */}
        <div className="relative">
          <button
            onClick={() => setDateOpen((o) => !o)}
            className="h-9 px-3 rounded-lg border border-[#e7e1cf] bg-white text-xs flex items-center gap-2 hover:border-[#b28c34] transition"
          >
            <Calendar size={13} />
            {dateRange === "all" ? "All Time" : dateRange === "7" ? "7 days" : dateRange === "30" ? "30 days" : "This year"}
            <ChevronDown size={12} className={`text-[#b28c34] transition-transform ${dateOpen ? "rotate-180" : ""}`} />
          </button>

          {dateOpen && (
            <div className="absolute mt-1 w-36 rounded-lg border border-[#e7e1cf] bg-white shadow-lg z-20">
              {[{ val: "all", label: "All Time" }, { val: "7", label: "Last 7 days" }, { val: "30", label: "Last 30 days" }, { val: "365", label: "This year" }].map((o) => (
                <button
                  key={o.val}
                  onClick={() => { setDateRange(o.val); setPage(1); setDateOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-[#f5f1e6] ${dateRange === o.val ? "font-semibold bg-[#f5f1e6]" : ""}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={clearFilters}
          className="h-9 px-3 rounded-lg border border-[#e7e1cf] bg-white text-xs text-[#6b6654] hover:bg-[#f5f1e6] transition"
        >
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#e7e1cf] overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="bg-[#1b180d]">
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Customer</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Phone</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Registered</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Last Login</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-white/80"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece3]">
              {users.map((user) => {
                const isFakeEmail = user.email?.includes("@raven.local");
                const isFakeName = !user.name || user.name.startsWith("phone-only");
                const displayName = isFakeName ? (user.phone || "Customer") : user.name;
                const displayEmail = isFakeEmail ? null : user.email;

                return (
                  <tr key={user._id} className="hover:bg-[#faf8f3] transition-colors duration-150">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={displayName} />
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[#1b180d] truncate">{displayName}</p>
                          {displayEmail && (
                            <p className="text-[11px] text-[#6b6654] truncate">{displayEmail}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-[12px] text-[#4a4637]">
                        <Phone size={12} className="text-[#9a864c]" />
                        {user.phone || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          user.isBanned
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        {user.isBanned ? "Banned" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#4a4637]">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#6b6654]">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/customers/${user._id}`}>
                        <button className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-[#e7e1cf] hover:bg-[#f5f1e6] hover:border-[#b28c34] transition">
                          View
                        </button>
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm text-[#9a864c]">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-[#f0ece3] text-xs">
          <p className="text-[#6b6654]">
            Showing <span className="font-semibold text-[#1b180d]">{showingFrom}</span> to{" "}
            <span className="font-semibold text-[#1b180d]">{showingTo}</span> of{" "}
            <span className="font-semibold text-[#1b180d]">{total}</span>
          </p>
          <div className="flex gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 border border-[#e7e1cf] rounded-lg hover:bg-[#f5f1e6] disabled:opacity-40 transition"
            >
              Previous
            </button>
            <button
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 border border-[#e7e1cf] rounded-lg hover:bg-[#f5f1e6] disabled:opacity-40 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Components */

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-[#e7e1cf] p-4 bg-white flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-[#fff9ee] flex items-center justify-center text-[#b28c34]">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-[#1b180d]">{value}</p>
        <p className="text-[11px] text-[#6b6654]">{label}</p>
      </div>
    </div>
  );
}

function Avatar({ name }) {
  const initials = (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-9 h-9 rounded-full bg-[#b28c34] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
      {initials}
    </div>
  );
}
