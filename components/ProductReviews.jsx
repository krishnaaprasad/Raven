"use client";
import { useState, useEffect } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Crimson_Text } from "next/font/google";
const crimson = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

function Stars({ count, className = "" }) {
  return (
    <span className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={17}
          className={
            i <= count
              ? "fill-current text-(--theme-text)"
              : "text-(--theme-border)"
          }
        />
      ))}
    </span>
  );
}

// 🕒 Helper: Time ago display
function timeAgo(dateString) {
  const diff = (Date.now() - new Date(dateString)) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString();
}

export default function ProductReviews({ productId, onSummary }) {
  const { data: session } = useSession();

  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", rating: 0, comment: "" });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [sortOption, setSortOption] = useState("newest");

  const reviewsPerPage = 3;
  const pagedReviews = reviews.slice(
    (page - 1) * reviewsPerPage,
    page * reviewsPerPage
  );

  const total = reviews.length;
  const countArr = [5, 4, 3, 2, 1].map(
    (star) => reviews.filter((r) => r.rating === star).length
  );
  const avg =
    total === 0
      ? 0
      : (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1);

  useEffect(() => {
    if (session?.user?.name) {
      setForm((f) => ({ ...f, name: session.user.name }));
    }
  }, [session]);

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/reviews?productId=${productId}`)
      .then((res) => res.json())
      .then((data) => {
        const sorted = sortReviews(data, sortOption);
        setReviews(sorted);
      });
  }, [productId]);

  useEffect(() => {
  if (onSummary) {
    onSummary({ avg, total });
  }
}, [avg, total]);



  function sortReviews(list, option) {
    const sorted = [...list];
    if (option === "newest") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (option === "oldest") {
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (option === "highest") {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (option === "lowest") {
      sorted.sort((a, b) => a.rating - b.rating);
    }
    return sorted;
  }

  function handleSortChange(option) {
    setSortOption(option);
    setReviews((prev) => sortReviews(prev, option));
    setPage(1);
  }

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
      setReviews((prev) => sortReviews([data, ...prev], sortOption));
      setForm({ name: session?.user?.name || "", rating: 0, comment: "" });
      setShowForm(false);
      setPage(1);
    } else alert(data.message || "Failed to submit review");
    setLoading(false);
  }

  return (
    <div className="flex flex-col md:flex-row bg-(--theme-bg)  px-0 md:px-6 py-6 transition-colors duration-300">      {/* LEFT: Summary Sidebar */}
      <div className="md:w-[290px] w-full shrink-0 px-4 mb-10 md:mb-0">
        {total === 0 ? (
          <p className="text-sm text-(--theme-muted)">No reviews yet. Be the first to review this product.</p>
        ) : (
          <>
            <div
  className={`${crimson.className} text-4xl leading-none font-semibold text-(--theme-text) flex items-center mb-2 `}
>

              {avg}
              <span className="ml-2">
                <Stars count={Math.round(avg)} />
              </span>
            </div>
            <div className="text-[13px] text-(--theme-muted) mb-5">
              Based on {total} review{total !== 1 ? "s" : ""}
            </div>
          </>
        )}
        <div className="space-y-2 mb-8 mt-2">
          {countArr.map((c, i) => (
            <div className="flex items-center gap-2" key={i}>
              <span className="w-7 text-xs text-(--theme-text)">{5 - i}★</span>
              <div className="flex-1 h-2 bg-(--theme-border) rounded">
                <div
                  className="h-2 rounded bg-(--theme-text)"
                  style={{ width: total ? `${(c / total) * 100}%` : 0 }}
                />
              </div>
              <span className="w-6 text-xs text-right text-(--theme-text)">{c}</span>
            </div>
          ))}
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full text-sm bg-(--theme-text) text-(--theme-bg) font-[system-ui] uppercase tracking-wider py-2 rounded-full hover:opacity-90 transition"
          >
            Write a Review
          </button>
        )}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-7 p-4 rounded border border-(--theme-border) bg-(--theme-bg) flex flex-col gap-3"
            style={{ maxWidth: 350 }}
          >
            <input
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border border-(--theme-border) rounded px-2 py-1 text-sm focus:border-(--theme-text) focus:ring-0 outline-none"
              required
              disabled={!!session?.user?.name}
            />

            <div>
              <label className="text-xs font-medium text-(--theme-muted) mb-1 block">
                Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className={
                      star <= form.rating
                        ? "fill-current text-(--theme-text) cursor-pointer"
                        : "text-(--theme-muted) cursor-pointer"
                    }
                    onClick={() => setForm((f) => ({ ...f, rating: star }))}
                  />
                ))}
              </div>
            </div>

            <textarea
              placeholder="Share your thoughts..."
              value={form.comment}
              onChange={(e) =>
                setForm((f) => ({ ...f, comment: e.target.value }))
              }
              className="w-full border border-(--theme-border) rounded px-2 py-1 text-sm focus:border-(--theme-text) focus:ring-0 outline-none"
              rows={3}
              required
            />

            <div className="flex gap-2 mt-1">
              <button
                type="submit"
                disabled={loading}
                className="bg-(--theme-text) text-(--theme-bg) rounded px-4 py-1.5 text-sm font-semibold hover:bg-(--theme-soft) transition disabled:opacity-50"
              >
                {loading ? "..." : "Submit"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-(--theme-text) text-(--theme-text) rounded px-4 py-1.5 text-sm font-semibold bg-(--theme-bg) hover:bg-(--theme-soft) transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* RIGHT: Reviews List */}
      <div className="flex-1 flex flex-col px-1 md:px-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className={`${crimson.className} text-lg font-bold text-(--theme-text)`}></h3>
          <select
            value={sortOption}
            onChange={(e) => handleSortChange(e.target.value)}
            className="border border-(--theme-border) rounded-md text-sm px-2 py-1 text-(--theme-text) bg-(--theme-bg)"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>

        {pagedReviews.length === 0 ? (
          <p className="text-(--theme-muted)">No reviews yet. Be the first to review!</p>
        ) : (
          pagedReviews.map((r, i) => (
            <div
              key={i}
              className="mb-8 pb-8 border-b border-(--theme-border) flex gap-4 items-start transition-all duration-300 hover:translate-x-0.5"          >
              <div className="rounded-full w-11 h-11 bg-(--theme-soft) flex items-center justify-center uppercase font-bold text-(--theme-text) tracking-wide text-[15px]">
                {r.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-(--theme-text) font-[system-ui]">{r.name}</span>
                    <CheckCircle2
                      size={14}
                      className="text-(--theme-text) mt-px"
                      title="Verified user"
                    />
                  </div>
                  <Stars count={r.rating} />
                </div>
                <div className="text-xs text-(--theme-muted) font-[system-ui] mb-1">{timeAgo(r.createdAt)}</div>
                <div className="text-(--theme-text) mb-2 font-[system-ui]">{r.comment}</div>
                {r.reply && (
                  <div className="mt-3 ml-10 border-l-2 border-(--theme-text) pl-3 bg-(--theme-soft) rounded-md py-2">
                    <p className="text-[13px] text-(--theme-text) font-semibold">Raven Support</p>
                    <p className="text-sm text-(--theme-muted) font-[system-ui]">{r.reply}</p>
                    <span className="text-[11px] text-(--theme-muted)">{timeAgo(r.replyAt)}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}


        {/* Pagination */}
        {total > reviewsPerPage && (
          <div className="flex gap-3 mt-3 items-center justify-start text-sm">
            <button
              className="bg-(--theme-soft) text-(--theme-text) px-3 py-1 rounded disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span className="text-(--theme-muted)">
              Showing {(page - 1) * reviewsPerPage + 1}-
              {Math.min(page * reviewsPerPage, total)} of {total}
            </span>
            <button
              className="bg-(--theme-soft) text-(--theme-text) px-3 py-1 rounded disabled:opacity-40"
              disabled={page >= Math.ceil(total / reviewsPerPage)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
