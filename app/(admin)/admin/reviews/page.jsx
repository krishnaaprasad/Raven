"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Trash2, X, RotateCcw } from "lucide-react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState("");

  async function fetchReviews() {
    setLoading(true);
    const res = await fetch("/api/admin/reviews");
    const data = await res.json();
    setReviews(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  function openReplyModal(review) {
    setSelectedReview(review);
    setReplyText(review.reply || "");
    setModalOpen(true);
  }

  async function submitReply() {
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
  }

  async function restoreReview(id) {
    if (!confirm("Are you sure? This will Show review from users.")) return;

    const res = await fetch(`/api/admin/reviews/${id}/restore`, { method: "PUT" });
    if (res.ok) {
        fetchReviews();
    } else {
        alert("Failed to restore review");
    }
    }

  async function softDeleteReview(id) {
    if (!confirm("Are you sure? This will hide review from users.")) return;

    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchReviews();
    } else {
      alert("Failed to delete.");
    }
  }

  return (
    <div className="p-0 bg-[#fcfbf8] min-h-screen text-[#1b180d]">

      {loading ? (
        <p className="text-gray-500">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-400">No reviews found.</p>
      ) : (
        <div className="overflow-x-auto border border-[#e7e1cf] rounded-xl shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-[#f3efe5]">
              <tr className="text-left">
                <th className="p-3">User</th>
                <th className="p-3">Product</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Review</th>
                <th className="p-3">Reply</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr
                    key={r._id}
                    className={`border-t border-[#e7e1cf] hover:bg-[#faf7f1] ${
                        r.deleted ? "opacity-40 bg-gray-200" : ""
                    }`}
                    >
                  <td className="p-3 font-semibold">{r.name}</td>
                  <td className="p-3">
                    <a href={`/product/${r.productId?.slug}`} className="text-[#b28c34] hover:underline">
                        {r.productId?.name || "Deleted Product"}
                    </a>
                    </td>
                  <td className="p-3 text-[#b28c34] font-bold">{r.rating}★</td>
                  <td className="p-3 max-w-xs">{r.comment}</td>
                  <td className="p-3 text-[#6a5c3e] italic">
                    {r.reply ? r.reply : "No reply yet"}
                  </td>

                  <td className="p-3 flex justify-end gap-3">
                    {!r.deleted && (
                        <>
                        <button
                            onClick={() => openReplyModal(r)}
                            className="text-[#b28c34] hover:text-[#917b2e] cursor-pointer"
                        >
                            <MessageSquare size={20} />
                        </button>

                        <button
                            onClick={() => softDeleteReview(r._id)}
                            className="text-red-500 hover:text-red-600 cursor-pointer"
                        >
                            <Trash2 size={20} />
                        </button>
                        </>
                    )}

                    {r.deleted && (
                        <button
                        onClick={() => restoreReview(r._id)}
                        className="text-green-600 hover:text-green-700 font-semibold cursor-pointer"
                        >
                        <RotateCcw size={20} />
                        </button>
                    )}
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- Reply Modal --- */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[90%] max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
              onClick={() => setModalOpen(false)}
            >
              <X size={22} />
            </button>

            <h2 className="text-xl font-bold text-[#b28c34] mb-4">
              Reply to: {selectedReview?.name}
            </h2>

            <textarea
              rows={5}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full border border-[#e7e1cf] rounded-lg p-3 text-sm focus:ring-0 focus:border-[#b28c34]"
              placeholder="Type your reply..."
            />

            <button
              onClick={submitReply}
              className="mt-4 w-full bg-[#b28c34] text-white py-2 rounded-lg font-semibold hover:bg-[#917b2e] transition cursor-pointer"
            >
              Save Reply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
