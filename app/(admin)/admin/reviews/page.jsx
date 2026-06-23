"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Trash2, X, RotateCcw, Star, Send, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 20;

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | replied | unreplied | deleted
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  async function fetchReviews(p = page) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews?page=${p}&limit=${PAGE_SIZE}`);
      const data = await res.json();
      if (data.reviews) {
        setReviews(data.reviews);
        setTotalPages(data.pages || 1);
        setTotalCount(data.total || 0);
        setPage(data.page || 1);
      } else if (Array.isArray(data)) {
        // Fallback for old API format
        setReviews(data);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews(1);
  }, []);

  function openReplyModal(review) {
    setSelectedReview(review);
    setReplyText(review.reply || "");
    setModalOpen(true);
  }

  async function submitReply() {
    setReplying(true);
    const res = await fetch(`/api/admin/reviews/${selectedReview._id}/reply`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: replyText }),
    });

    if (res.ok) {
      setModalOpen(false);
      fetchReviews();
    } else {
      alert("Failed to reply.");
    }
    setReplying(false);
  }

  async function restoreReview(id) {
    if (!confirm("Restore this review? It will be visible to users again.")) return;
    const res = await fetch(`/api/admin/reviews/${id}/restore`, { method: "PUT" });
    if (res.ok) fetchReviews();
    else alert("Failed to restore review");
  }

  async function softDeleteReview(id) {
    if (!confirm("Hide this review from users?")) return;
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    if (res.ok) fetchReviews();
    else alert("Failed to delete.");
  }

  // Filter logic
  const filtered = reviews.filter((r) => {
    if (filter === "replied") return r.reply && !r.deleted;
    if (filter === "unreplied") return !r.reply && !r.deleted;
    if (filter === "deleted") return r.deleted;
    return true;
  });

  const stats = {
    total: reviews.length,
    replied: reviews.filter((r) => r.reply && !r.deleted).length,
    unreplied: reviews.filter((r) => !r.reply && !r.deleted).length,
    deleted: reviews.filter((r) => r.deleted).length,
    avgRating: reviews.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0",
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat label="Total Reviews" value={stats.total} />
        <MiniStat label="Avg. Rating" value={`${stats.avgRating} ★`} />
        <MiniStat label="Unreplied" value={stats.unreplied} warning={stats.unreplied > 0} />
        <MiniStat label="Hidden" value={stats.deleted} />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { val: "all", label: "All" },
          { val: "unreplied", label: "Unreplied" },
          { val: "replied", label: "Replied" },
          { val: "deleted", label: "Hidden" },
        ].map((f) => (
          <button
            key={f.val}
            onClick={() => setFilter(f.val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              filter === f.val
                ? "bg-[#b28c34] text-white border-[#b28c34]"
                : "bg-white border-[#e7e1cf] text-[#4a4637] hover:border-[#b28c34]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Reviews Table */}
      <div className="rounded-xl border border-[#e7e1cf] overflow-hidden bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-sm text-[#6b6654]">
            <div className="w-5 h-5 border-2 border-[#b28c34] border-t-transparent rounded-full animate-spin mb-2" />
            Loading reviews...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#9a864c]">No reviews found</div>
        ) : (
          <div className="divide-y divide-[#f0ece3]">
            {filtered.map((r) => (
              <div
                key={r._id}
                className={`flex flex-col sm:flex-row gap-4 p-4 hover:bg-[#faf8f3] transition-colors duration-150 ${
                  r.deleted ? "opacity-50" : ""
                }`}
              >
                {/* Left: User + Product + Rating */}
                <div className="sm:w-48 shrink-0">
                  <p className="text-[13px] font-semibold text-[#1b180d]">{r.name}</p>
                  <a
                    href={`/product/${r.productId?.slug}`}
                    className="text-[12px] text-[#b28c34] hover:underline"
                  >
                    {r.productId?.name || "Unknown Product"}
                  </a>
                  <div className="flex items-center gap-0.5 mt-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        className={s <= r.rating ? "fill-[#b28c34] text-[#b28c34]" : "text-[#e7e1cf]"}
                      />
                    ))}
                    <span className="text-[11px] text-[#6b6654] ml-1">{r.rating}/5</span>
                  </div>
                </div>

                {/* Center: Comment + Reply */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[#1b180d] leading-relaxed">
                    {r.comment}
                  </p>
                  {r.reply && (
                    <div className="mt-2 pl-3 border-l-2 border-[#b28c34]">
                      <p className="text-[11px] text-[#6b6654] italic">{r.reply}</p>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex sm:flex-col items-center gap-2 shrink-0">
                  {!r.deleted && (
                    <>
                      <button
                        onClick={() => openReplyModal(r)}
                        title={r.reply ? "Edit Reply" : "Reply"}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#fff9ee] text-[#b28c34] transition"
                      >
                        <MessageSquare size={15} />
                      </button>
                      <button
                        onClick={() => softDeleteReview(r._id)}
                        title="Hide review"
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                  {r.deleted && (
                    <button
                      onClick={() => restoreReview(r._id)}
                      title="Restore"
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-50 text-green-600 transition"
                    >
                      <RotateCcw size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs">
          <p className="text-[#6b6654]">
            Page <span className="font-semibold text-[#1b180d]">{page}</span> of{" "}
            <span className="font-semibold text-[#1b180d]">{totalPages}</span>
            {" "}({totalCount} reviews)
          </p>
          <div className="flex gap-1">
            <button
              disabled={page <= 1}
              onClick={() => fetchReviews(page - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e7e1cf] hover:bg-[#f5f1e6] disabled:opacity-40 transition"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => fetchReviews(page + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e7e1cf] hover:bg-[#f5f1e6] disabled:opacity-40 transition"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative text-[#1b180d]">
            <button
              className="absolute top-3 right-3 p-1.5 rounded-lg text-[#6b6654] hover:bg-[#f5f1e6]"
              onClick={() => setModalOpen(false)}
            >
              <X size={18} />
            </button>

            <h2 className="text-base font-bold mb-1">
              Reply to {selectedReview?.name}
            </h2>
            <p className="text-[11px] text-[#6b6654] mb-4">
              {selectedReview?.productId?.name} · {selectedReview?.rating}★
            </p>

            {/* Original review */}
            <div className="bg-[#fcfbf8] border border-[#e7e1cf] rounded-lg p-3 mb-4 text-xs text-[#4a4637]">
              &ldquo;{selectedReview?.comment}&rdquo;
            </div>

            <textarea
              rows={4}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full border border-[#e7e1cf] rounded-lg p-3 text-sm focus:outline-none focus:border-[#b28c34] bg-white text-[#1b180d]"
              placeholder="Write your reply..."
            />

            <button
              onClick={submitReply}
              disabled={replying || !replyText.trim()}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-[#b28c34] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#9a864c] transition disabled:opacity-60"
            >
              <Send size={14} />
              {replying ? "Sending..." : selectedReview?.reply ? "Update Reply" : "Send Reply"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, warning }) {
  return (
    <div className={`rounded-xl border p-4 bg-white ${warning ? "border-orange-200" : "border-[#e7e1cf]"}`}>
      <p className="text-xl font-bold text-[#1b180d]">{value}</p>
      <p className="text-[11px] text-[#6b6654]">{label}</p>
    </div>
  );
}
