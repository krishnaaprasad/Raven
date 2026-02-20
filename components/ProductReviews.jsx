"use client";

import { useState, useEffect, useMemo } from "react";
import { Star, ChevronDown, ChevronRight, Upload, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

const REVIEWS_PER_PAGE = 4;

/* ───────────────────────── */
/* ⭐ Star Rating Component */
/* ───────────────────────── */

const StarRating = ({ rating, size = 16 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        style={{ width: size, height: size }}
        className={
          s <= rating
            ? "fill-(--theme-text) text-(--theme-text)"
            : "fill-transparent  text-(--theme-border)"
        }
      />
    ))}
  </div>
);

/* ───────────────────────── */
/* Main Component */
/* ───────────────────────── */

export default function ProductReviews({ productId }) {
  const { data: session } = useSession();

  const [reviews, setReviews] = useState([]);
  const [sortBy, setSortBy] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    rating: 0,
    title: "",
    body: "",
    name: "",
    images: [],
  });

  /* ───────────────────────── */
  /* Fetch Reviews */
  /* ───────────────────────── */

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/reviews?productId=${productId}`)
      .then((res) => res.json())
      .then((data) => setReviews(data));
  }, [productId]);

  useEffect(() => {
    if (session?.user?.name) {
      setForm((prev) => ({
        ...prev,
        name: session.user.name,
      }));
    }
  }, [session]);

  /* ───────────────────────── */
  /* Sorting */
  /* ───────────────────────── */

  const sortedReviews = useMemo(() => {
    const copy = [...reviews];

    if (sortBy === "recent")
      copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (sortBy === "highest") copy.sort((a, b) => b.rating - a.rating);

    if (sortBy === "lowest") copy.sort((a, b) => a.rating - b.rating);

    return copy;
  }, [reviews, sortBy]);

  const totalPages = Math.ceil(sortedReviews.length / REVIEWS_PER_PAGE);

  const paginatedReviews = sortedReviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE
  );

  /* ───────────────────────── */
  /* Rating Breakdown */
  /* ───────────────────────── */

  const breakdown = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => counts[r.rating]++);
    return counts;
  }, [reviews]);

  const avg =
    reviews.length > 0
      ? (
          reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        ).toFixed(2)
      : "0.00";

  /* ───────────────────────── */
  /* Cloudinary Upload */
  /* ───────────────────────── */

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    const data = await res.json();
    return data.secure_url;
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const urls = await Promise.all(files.map(uploadToCloudinary));


    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...urls],
    }));
  };

  const [submitting, setSubmitting] = useState(false);

  /* ───────────────────────── */
  /* Submit Review */
  /* ───────────────────────── */

const handleSubmit = async (e) => {
  e.preventDefault();
  

  const res = await fetch("/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productId,
      name: form.name,
      rating: form.rating,
      comment: form.body,
      title: form.title,
      images: form.images,
      isVerified: !!session?.user,
    }),
  });

  const data = await res.json();

  if (res.ok) {
    // Re-fetch from DB to ensure fresh data
    const fresh = await fetch(`/api/reviews?productId=${productId}`);
    const updated = await fresh.json();
    setReviews((prev) => [data, ...prev]);

    setShowForm(false);
    setForm({ rating: 0, title: "", body: "", name: "", images: [] });
  }
};


  /* ───────────────────────── */
  /* UI */
  /* ───────────────────────── */

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">

      {/* ── Summary Layout (3 column) ── */}

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_1fr] gap-8 items-center pb-5">

        {/* Left */}
        <div className="flex flex-col gap-1.5 items-center ">
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(avg)} />
            <span className="text-sm font-semibold text-(--theme-text)">
              {avg} out of 5
            </span>
          </div>
          <p className="text-sm text-(--theme-muted)">
            Based on {reviews.length} reviews
          </p>
        </div>

        {/* Center - Rating bars */}
<div className="space-y-2">
  {[5, 4, 3, 2, 1].map((s) => {
    const count = breakdown[s] || 0;
    const pct =
      reviews.length > 0
        ? (count / reviews.length) * 100
        : 0;

    return (
      <div key={s} className="flex items-center gap-2">

        {/* Stars */}
        <div className="w-[110px]">
          <StarRating rating={s} size={16} />
        </div>

        {/* Bar */}
        <div className="flex-1 h-3.5 bg-(--theme-border)/40">
          <div
            className="h-full bg-(--theme-text)"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Count */}
        <div className="w-6 text-right text-sm text-(--theme-text)">
          {count}
        </div>

      </div>
    );
  })}
</div>


        {/* Right */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-8 py-3 bg-(--theme-text) text-(--theme-bg) text-sm sm:text-base font-semibold hover:opacity-90 transition cursor-pointer"
          >
            {showForm ? "Cancel review" : "Write a review"}
          </button>
        </div>
      </div>

      <AnimatePresence>
  {showForm && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      <div className="max-w-2xl mx-auto mt-5">

  <div className="bg-(--theme-soft)/30 backdrop-blur-sm border border-(--theme-border)/60 px-10 py-8 rounded-sm">

    <h3 className="font-[system-ui] text-[24px] text-center text-(--theme-text) mb-10 tracking-wide">
      Write a Review
    </h3>

    <form onSubmit={handleSubmit} className="space-y-10">

      {/* Rating */}
      <div className="text-center">
        <label className="text-[13px] uppercase tracking-[0.2em] text-(--theme-muted) block mb-5">
          Your Rating
        </label>

        <div className="flex justify-center gap-3">
          {[1,2,3,4,5].map((star)=>(
            <button
              key={star}
              type="button"
              onClick={() => setForm(prev => ({...prev, rating: star}))}
              className="transition-transform duration-200 hover:scale-110 cursor-pointer"
            >
              <Star
                className={`w-8 h-8 transition-colors duration-200 ${
                  star <= form.rating
                    ? "fill-(--theme-text) text-(--theme-text)"
                    : "fill-transparent text-(--theme-border)"
                }`}
              />
            </button>
          ))}
        </div>
      </div>


      {/* Title */}
      <div>
        <label className="text-[12px] uppercase tracking-[0.18em] text-(--theme-text) block mb-3">
          Review Title
        </label>

        <input
          type="text"
          required
          value={form.title}
          onChange={(e)=>setForm(prev=>({...prev,title:e.target.value}))}
          placeholder="Summarize your experience"
          className="w-full h-12 px-4 bg-transparent border-b border-(--theme-border) focus:border-(--theme-text) outline-none text-(--theme-text) text-[15px] transition-colors"
        />
      </div>


      {/* Review Body */}
      <div>
        <label className="text-[12px] uppercase tracking-[0.18em] text-(--theme-text) block mb-3">
          Your Review
        </label>

        <textarea
          required
          rows={5}
          value={form.body}
          onChange={(e)=>setForm(prev=>({...prev,body:e.target.value}))}
          placeholder="Share details of your experience..."
          className="w-full px-4 py-4 bg-transparent border border-(--theme-border) focus:border-(--theme-text) outline-none text-(--theme-text) text-[14px] leading-relaxed resize-none transition-colors"
        />
      </div>


      {/* Image Upload */}
      <div>
        <label className="text-[12px] uppercase tracking-[0.18em] text-(--theme-text) block mb-4 text-center">
          Add Photos (Optional)
        </label>

        <div className="flex justify-center">

          <label className="w-28 h-28 border border-dashed border-(--theme-border) flex items-center justify-center cursor-pointer hover:border-(--theme-text) transition-all duration-300">
            <Upload className="w-7 h-7 text-(--theme-muted)" />
            <input
              type="file"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

        </div>

        {form.images.length > 0 && (
          <div className="flex gap-4 mt-6 justify-center flex-wrap">
            {form.images.map((img,i)=>(
              <div key={i} className="relative group">
                <img
                  src={img}
                  className="w-20 h-20 object-cover border border-(--theme-border)"
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm(prev=>({
                      ...prev,
                      images: prev.images.filter((_,index)=>index!==i)
                    }))
                  }
                  className="absolute -top-2 -right-2 w-6 h-6 bg-(--theme-text) text-(--theme-bg) text-xs flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* Display Name */}
      <div>
        <label className="text-[12px] uppercase tracking-[0.18em] text-(--theme-text) block mb-3">
          Display Name
        </label>

        <input
          type="text"
          required
          disabled={!!session?.user}
          value={form.name}
          onChange={(e)=>setForm(prev=>({...prev,name:e.target.value}))}
          placeholder="Your name"
          className="w-full h-12 px-4 bg-transparent border-b border-(--theme-border) focus:border-(--theme-text) outline-none text-(--theme-text) text-[15px] transition-colors disabled:opacity-60"
        />
      </div>


      {/* Buttons */}
      <div className="flex justify-center gap-6 pt-4">

        <button
          type="button"
          onClick={()=>setShowForm(false)}
          className="px-8 py-3 border border-(--theme-text) text-(--theme-text) text-[13px] uppercase tracking-wide hover:bg-(--theme-soft) transition cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting || !form.rating || !form.title || !form.body || !form.name}
          className="px-10 py-3 bg-(--theme-text) text-(--theme-bg) text-[13px] uppercase tracking-wide disabled:opacity-40 hover:opacity-90 transition cursor-pointer"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>

      </div>

    </form>
  </div>
</div>

    </motion.div>
  )}
</AnimatePresence>

<div className="max-w-6xl mx-auto mt-8 flex items-center justify-start gap-4">
  <div className="relative inline-block">

    <select
      value={sortBy}
      onChange={(e) => {
        setSortBy(e.target.value);
        setCurrentPage(1);
      }}
      className="
        appearance-none
        bg-(--theme-bg)
        
        pb-1 pr-6 px-1.5
        text-sm
        text-(--theme-text)
        focus:outline-none
        focus:border-(--theme-text)
        cursor-pointer
      "
    >
      <option value="recent">Most Recent</option>
      <option value="highest">Highest Rating</option>
      <option value="lowest">Lowest Rating</option>
    </select>

    <ChevronDown
      className="
        absolute right-0 top-1/2 -translate-y-1/2
        w-4 h-4
        text-(--theme-muted)
        pointer-events-none
      "
    />
  </div>
</div>


      {/* ── Review Cards ── */}

      <div className="mt-12 space-y-10">
        {paginatedReviews.map((r, idx) => (
          <motion.div
            key={r._id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className=" transition-all duration-300 hover:translate-x-0.5"
          >
            <div className="flex justify-between mb-2">
              <StarRating rating={r.rating} size={17} />
              <span className="text-xs text-(--theme-muted)">
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 border border-(--theme-border) flex items-center justify-center">
                <User size={19} />
              </div>

              <span className="text-sm sm:text-base text-(--theme-text)">
                {r.name}
              </span>

              {r.isVerified && (
                <span className="text-xs font-semibold text-(--theme-bg) bg-(--theme-text) px-2 py-0.5">
                  Verified
                </span>
              )}
            </div>

            {r.title && (
              <p className=" text-[14.5px] sm:text-[16.2px]  font-semibold text text-(--theme-text) font-[system-ui]">
                {r.title}
              </p>
            )}

            <p className="text-sm sm:text-base text-(--theme-muted) mb-1 whitespace-pre-line font-[system-ui]">
              {r.comment}
            </p>

            {r.reply && (
  <div className="mt-6 ml-10 border-l border-(--theme-border) pl-6 py-4 bg-(--theme-soft)/40 rounded-sm">

    <div className="flex items-center gap-2 mb-1">
      <span className="text-sm font-semibold text-(--theme-text)">
        Raven Fragrance
      </span>
      <span className="text-[10px] uppercase tracking-[0.2em] text-(--theme-muted)">
        Staff
      </span>
    </div>

    <p className="text-sm text-(--theme-muted) leading-relaxed">
      {r.reply}
    </p>

    {r.replyAt && (
      <p className="text-xs text-(--theme-muted) mt-2">
        {new Date(r.replyAt).toLocaleDateString()}
      </p>
    )}
  </div>
)}


            {r.images?.length > 0 && (
              <div className="flex gap-3 mt-4">
                {r.images.map((img, i) => (
                  <div key={i} className="w-20 h-20 border border-(--theme-border)">
                    <img
                      src={img}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
      

      {/* ── Pagination ── */}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 border ${
                page === currentPage
                  ? "bg-(--theme-text) text-(--theme-bg)"
                  : "border-(--theme-border)"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
