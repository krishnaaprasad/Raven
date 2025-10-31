"use client";
import { useState, useEffect } from "react";
import { Star } from "lucide-react";

function Stars({ count, className = "" }) {
  return (
    <span className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map(i =>
        <Star
          key={i}
          size={17}
          className={i <= count ? "fill-[#b28c34] text-[#b28c34]" : "text-gray-300"}
        />
      )}
    </span>
  );
}

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", rating: 0, comment: "" });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const reviewsPerPage = 3;
  const pagedReviews = reviews.slice((page - 1) * reviewsPerPage, page * reviewsPerPage);

  const total = reviews.length;
  const countArr = [5, 4, 3, 2, 1].map(star =>
    reviews.filter(r => r.rating === star).length
  );
  const avg =
    total === 0
      ? 0
      : (
        reviews.reduce((sum, r) => sum + r.rating, 0) / total
      ).toFixed(1);

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/reviews?productId=${productId}`)
      .then(res => res.json())
      .then(setReviews);
  }, [productId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.rating || !form.comment) {
      alert("Please fill all fields");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, ...form }),
    });
    const data = await res.json();
    if (res.ok) {
      setReviews(prev => [data, ...prev]);
      setForm({ name: "", rating: 0, comment: "" });
      setShowForm(false);
      setPage(1);
    } else alert(data.message || "Failed to submit review");
    setLoading(false);
  }

  return (
    <div className="flex flex-col md:flex-row bg-[#FCF8F3] rounded-xl px-0 md:px-6 py-6 border border-[#ede7d7]">
      {/* LEFT: Summary Sidebar */}
      <div className="md:w-[290px] w-full flex-shrink-0 px-4 mb-10 md:mb-0">
        <div className="text-[2.5rem] leading-none font-extrabold text-[#b28c34] flex items-center mb-2">
          {avg}
          <span className="ml-2"><Stars count={Math.round(avg)} /></span>
        </div>
        <div className="text-[#95874f] text-[13px] mb-5">
          Based on {total} review{total !== 1 ? "s" : ""}
        </div>
        <div className="space-y-2 mb-8">
          {countArr.map((c, i) => (
            <div className="flex items-center gap-2" key={i}>
              <span className="w-7 text-xs text-[#bfa447]">{5 - i}★</span>
              <div className="flex-1 h-2 bg-gray-200 rounded">
                <div
                  className="h-2 rounded bg-[#eddc9d]"
                  style={{ width: total ? `${(c / total) * 100}%` : 0 }}
                />
              </div>
              <span className="w-6 text-xs text-right text-[#b28c34]">{c}</span>
            </div>
          ))}
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-[#B28C34] hover:bg-[#917b2e] transition text-white font-bold py-2 rounded-full"
          >
            Write a Review
          </button>
        )}
        {showForm && (
  <form 
    onSubmit={handleSubmit} 
    className="mt-7 p-4 rounded border border-[#e4d5b5] bg-white flex flex-col gap-3"
    style={{ maxWidth: 350 }}>
    
    <input
      type="text"
      placeholder="Your name"
      value={form.name}
      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
      className="w-full border border-[#e4d5b5] rounded px-2 py-1 text-sm focus:border-[#b28c34] focus:ring-0 outline-none"
      required
    />

    <div>
      <label className="text-xs font-medium text-[#7b6742] mb-1 block">Rating</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={18}
            className={star <= form.rating
              ? "fill-[#b28c34] text-[#b28c34] cursor-pointer"
              : "text-gray-300 cursor-pointer"}
            onClick={() => setForm(f => ({ ...f, rating: star }))}
          />
        ))}
      </div>
    </div>

    <textarea
      placeholder="Share your thoughts..."
      value={form.comment}
      onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
      className="w-full border border-[#e4d5b5] rounded px-2 py-1 text-sm focus:border-[#b28c34] focus:ring-0 outline-none"
      rows={3}
      required
    />

    <div className="flex gap-2 mt-1">
      <button
        type="submit"
        disabled={loading}
        className="bg-[#b28c34] text-white rounded px-4 py-1.5 text-sm font-semibold hover:bg-[#917b2e] transition disabled:opacity-50"
        style={{ minWidth: 0 }}
      >
        {loading ? "..." : "Submit"}
      </button>
      <button
        type="button"
        onClick={() => setShowForm(false)}
        className="border border-[#b28c34] text-[#b28c34] rounded px-4 py-1.5 text-sm font-semibold bg-white hover:bg-[#faf6ed] transition"
        style={{ minWidth: 0 }}
      >
        Cancel
      </button>
    </div>
  </form>
        )}
      </div>

      {/* RIGHT: Reviews List */}
      <div className="flex-1 flex flex-col px-1 md:px-6">
        <h3 className="text-lg font-bold text-[#30270e] mb-3">Customer Reviews</h3>
        {pagedReviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        ) : (
          pagedReviews.map((r, i) => (
            <div
              key={i}
              className="mb-8 pb-8 border-b border-[#eddc9d] flex gap-4 items-start"
            >
              <div className="rounded-full w-11 h-11 bg-[#e4d5b5] flex items-center justify-center uppercase font-bold text-[#917b2e] tracking-wide text-[15px]">
                {r.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#33270a]">{r.name}</span>
                  <Stars count={r.rating} />
                </div>
                <div className="text-xs text-[#b3a575] mb-1">
                  {new Date(r.createdAt).toLocaleDateString(undefined, {
                    year: "numeric", month: "short", day: "numeric"
                  })}
                </div>
                <div className="text-[#4b423c] mb-2">{r.comment}</div>
              </div>
            </div>
          ))
        )}
        {/* Pagination */}
        {total > reviewsPerPage && (
          <div className="flex gap-3 mt-3 items-center justify-start text-sm">
            <button
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >Previous</button>
            <span className="text-gray-400">
              Showing {((page - 1) * reviewsPerPage) + 1}-
              {Math.min(page * reviewsPerPage, total)} of {total}
            </span>
            <button
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded disabled:opacity-40"
              disabled={page >= Math.ceil(total / reviewsPerPage)}
              onClick={() => setPage(p => p + 1)}
            >Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
