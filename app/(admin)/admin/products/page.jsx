// app/(admin)/admin/products/page.jsx
"use client";

import { useEffect, useState } from "react";
import ProductRow from "./ProductRow";
import { Search, ChevronLeft, ChevronRight, Plus } from "lucide-react";

export default function ProductsPage() {
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", meta.limit);

      if (q) params.set("q", q);

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const json = await res.json();
      if (res.ok) {
        setProducts(json.data || []);
        setMeta(json.meta);
      }
    } catch (err) {
      console.error("fetchProducts error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, []);

  const changePage = (p) => {
    fetchProducts(p);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* HEADER SEARCH + ADD BUTTON */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="flex items-center w-full rounded-lg border border-[#e7e1cf] bg-[#fcfbf8] px-4 py-2">
            <Search size={20} className="text-[#b28c34]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by Product Name, Slug, Brand..."
              className="ml-3 w-full bg-transparent outline-none text-[15px] text-[#1b180d]"
            />
            <button
              onClick={() => fetchProducts(1)}
              className="ml-3 px-4 py-2 bg-[#b28c34] text-white text-sm font-semibold rounded-lg hover:bg-[#9a864c] transition"
            >
              Search
            </button>
          </div>
        </div>

        <button
          onClick={() => window.location.assign("/admin/products/add")}
          className="flex items-center justify-center gap-2 h-10 px-3 rounded-lg bg-[#b28c34] text-white text-sm font-bold hover:bg-[#9a864c] transition"
        >
          <Plus size={18} /> Add New Product
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#e7e1cf] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#fcfbf8] text-[12px] uppercase text-[#1b180d]/60">
              <tr>
                <th className="p-4">Image</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">URL</th>
                <th className="p-4">Brand</th>
                <th className="p-4">Base Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-sm">
                    Loading...
                  </td>
                </tr>
              ) : products.length ? (
                products.map((p) => (
                  <ProductRow key={p._id} product={p} refresh={() => fetchProducts(meta.page)} />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-sm text-gray-500">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 text-sm">
          <button
            disabled={meta.page === 1}
            onClick={() => changePage(meta.page - 1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-[#f5f1e6] disabled:opacity-40"
          >
            <ChevronLeft size={16} /> Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: meta.pages }, (_, i) => (
              <button
                key={i}
                onClick={() => changePage(i + 1)}
                className={`w-8 h-8 rounded-lg ${
                  meta.page === i + 1
                    ? "bg-[#b28c34] text-white"
                    : "hover:bg-[#e7e1cf]"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            disabled={meta.page === meta.pages}
            onClick={() => changePage(meta.page + 1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-[#f5f1e6] disabled:opacity-40"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
