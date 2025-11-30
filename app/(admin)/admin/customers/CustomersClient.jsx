"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, Calendar, ChevronDown, X } from "lucide-react";

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
  const [status, setStatus] = useState("all");      // all | active | banned
  const [dateRange, setDateRange] = useState("all"); // all | 7 | 30 | 365

  const [statusOpen, setStatusOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  // 🔁 Fetch data whenever filters / page change
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
    <div className="font-[Manrope,sans-serif] text-[#1b180d] space-y-6">

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="New Users (Last 30 days)" value={stats.newUsers30} />
        <StatCard label="Active Today" value={stats.activeToday} />
      </div>

      {/* SEARCH + FILTERS */}
      <div className="flex flex-wrap gap-3 items-center">

        {/* Search input */}
        <div className="flex items-center w-full md:flex-1 h-11 rounded-lg border border-[#e7e1cf] bg-white">
          <div className="px-3 text-gray-500">
            <Search size={18} />
          </div>
          <input
            className="flex-1 h-full text-sm outline-none"
            placeholder="Search by name, email, or user ID..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
          {search && (
            <button
              className="px-3 text-gray-400"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setStatusOpen((o) => !o)}
            className="flex items-center gap-2 h-11 px-4 rounded-lg border border-[#e7e1cf] bg-white text-sm"
          >
            <Filter size={16} />
            <span>Status: {status === "all" ? "All" : status === "active" ? "Active" : "Banned"}</span>
            <ChevronDown size={14} />
          </button>

          {statusOpen && (
            <div className="absolute mt-2 w-40 rounded-lg border border-[#e7e1cf] bg-white shadow-lg z-20">
              <DropdownButton
                label="All"
                active={status === "all"}
                onClick={() => {
                  setStatus("all");
                  setPage(1);
                  setStatusOpen(false);
                }}
              />
              <DropdownButton
                label="Active"
                active={status === "active"}
                onClick={() => {
                  setStatus("active");
                  setPage(1);
                  setStatusOpen(false);
                }}
              />
              <DropdownButton
                label="Banned"
                active={status === "banned"}
                onClick={() => {
                  setStatus("banned");
                  setPage(1);
                  setStatusOpen(false);
                }}
              />
            </div>
          )}
        </div>

        {/* Registration date filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDateOpen((o) => !o)}
            className="flex items-center gap-2 h-11 px-4 rounded-lg border border-[#e7e1cf] bg-white text-sm"
          >
            <Calendar size={16} />
            <span>
              {dateRange === "all"
                ? "Registration Date"
                : dateRange === "7"
                ? "Last 7 days"
                : dateRange === "30"
                ? "Last 30 days"
                : "This year"}
            </span>
            <ChevronDown size={14} />
          </button>

          {dateOpen && (
            <div className="absolute mt-2 w-44 rounded-lg border border-[#e7e1cf] bg-white shadow-lg z-20">
              <DropdownButton
                label="All time"
                active={dateRange === "all"}
                onClick={() => {
                  setDateRange("all");
                  setPage(1);
                  setDateOpen(false);
                }}
              />
              <DropdownButton
                label="Last 7 days"
                active={dateRange === "7"}
                onClick={() => {
                  setDateRange("7");
                  setPage(1);
                  setDateOpen(false);
                }}
              />
              <DropdownButton
                label="Last 30 days"
                active={dateRange === "30"}
                onClick={() => {
                  setDateRange("30");
                  setPage(1);
                  setDateOpen(false);
                }}
              />
              <DropdownButton
                label="This year"
                active={dateRange === "365"}
                onClick={() => {
                  setDateRange("365");
                  setPage(1);
                  setDateOpen(false);
                }}
              />
            </div>
          )}
        </div>

        {/* Clear filters */}
        <button
          type="button"
          onClick={clearFilters}
          className="h-11 px-4 rounded-lg border border-[#e7e1cf] bg-white text-sm"
        >
          Clear Filters
        </button>
      </div>

      {/* TABLE + PAGINATION */}
      <div className="rounded-xl border border-[#e7e1cf] overflow-hidden bg-white">
        <table className="min-w-full divide-y divide-[#e7e1cf] text-sm">
          <thead className="bg-[#f5f1e6]">
            <tr>
              <th className="py-3 pl-4 text-left font-semibold">User Name</th>
              <th className="px-3 text-left font-semibold">Status</th>
              <th className="px-3 text-left font-semibold">Registration Date</th>
              <th className="px-3 text-left font-semibold">Last Login</th>
              <th className="py-3 pr-4 text-right font-semibold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e7e1cf] bg-[#fcfbf8]">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="py-4 pl-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} />
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      user.isBanned
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {user.isBanned ? "Banned" : "Active"}
                  </span>
                </td>
                <td className="px-3">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-3">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleString()
                    : "—"}
                </td>
                <td className="pr-4 text-right">
                  <Link href={`/admin/customers/${user._id}`}>
                    <button className="border border-[#e7e1cf] px-3 py-1.5 rounded-lg text-xs md:text-sm hover:bg-[#f5f1e6]">
                      Manage User
                    </button>
                  </Link>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-6 text-center text-sm text-gray-500"
                >
                  No users found with current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 text-xs sm:text-sm">
          <p>
            Showing <b>{showingFrom}</b> to <b>{showingTo}</b> of{" "}
            <b>{total}</b> results
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 border border-[#e7e1cf] rounded-md disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 border border-[#e7e1cf] rounded-md disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Sub components */

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl p-5 border border-[#e7e1cf] bg-[#fcfbf8] flex flex-col gap-1">
      <p className="text-xs md:text-sm text-gray-600">{label}</p>
      <p className="text-2xl md:text-3xl font-bold">{value}</p>
    </div>
  );
}

function DropdownButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-2 text-xs md:text-sm rounded-md hover:bg-[#f4efe0] ${
        active ? "font-semibold bg-[#f4efe0]" : ""
      }`}
    >
      {label}
    </button>
  );
}

function Avatar({ name }) {
  if (!name) return null;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-[#b28c34] text-white font-semibold flex items-center justify-center">
      {initials}
    </div>
  );
}
