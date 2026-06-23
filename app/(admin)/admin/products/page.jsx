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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-lg rounded-xl border border-[#e7e1cf] bg-white px-3 h-10">
          <Search size={16} className="text-[#9a864c] shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchProducts(1)}
            placeholder="Search by name, slug, brand..."
            className="flex-1 bg-transparent outline-none text-sm text-[#1b180d] placeholder:text-[#9a864c]"
          />
          <button
            onClick={() => fetchProducts(1)}
            className="px-3 py-1.5 bg-[#b28c34] text-white text-xs font-semibold rounded-lg hover:bg-[#9a864c] transition"
          >
            Search
          </button>
        </div>

        <button
          onClick={() => window.location.assign("/admin/products/add")}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#1b180d] text-white text-xs font-semibold hover:bg-[#2a2618] transition"
        >
          <Plus size={15} /> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#e7e1cf] overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px]">
            <thead>
              <tr className="bg-[#1b180d]">
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Product</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Slug</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Brand</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Price</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/80">Stock</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-white/80">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece3]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-sm text-[#6b6654]">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#b28c34] border-t-transparent rounded-full animate-spin" />
                      Loading products...
                    </div>
                  </td>
                </tr>
              ) : products.length ? (
                products.map((p) => (
                  <ProductRow key={p._id} product={p} refresh={() => fetchProducts(meta.page)} />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-sm text-[#9a864c]">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#f0ece3] text-xs">
          <p className="text-[#6b6654]">
            Page <span className="font-semibold text-[#1b180d]">{meta.page}</span> of{" "}
            <span className="font-semibold text-[#1b180d]">{meta.pages}</span>
            {" "}({meta.total} products)
          </p>

          <div className="flex items-center gap-1">
            <button
              disabled={meta.page === 1}
              onClick={() => fetchProducts(meta.page - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e7e1cf] hover:bg-[#f5f1e6] disabled:opacity-40 transition"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: Math.min(meta.pages, 7) }, (_, i) => {
              let pageNum = i + 1;
              if (meta.pages > 7) {
                if (meta.page <= 4) pageNum = i + 1;
                else if (meta.page >= meta.pages - 3) pageNum = meta.pages - 6 + i;
                else pageNum = meta.page - 3 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => fetchProducts(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                    meta.page === pageNum
                      ? "bg-[#b28c34] text-white shadow-sm"
                      : "hover:bg-[#f5f1e6] text-[#1b180d]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              disabled={meta.page === meta.pages}
              onClick={() => fetchProducts(meta.page + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e7e1cf] hover:bg-[#f5f1e6] disabled:opacity-40 transition"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
