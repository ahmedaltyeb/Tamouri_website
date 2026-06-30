"use client";

import { useEffect, useState, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Review {
  id: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  user: { name: string };
}

interface ReviewsData {
  reviews: Review[];
  total: number;
  page: number;
  pages: number;
  myReview: {
    id: string;
    rating: number;
    title: string;
    body: string;
    approved: boolean;
  } | null;
}

interface Props {
  productId: string;
  initialRating: number;
  initialCount: number;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StarPicker({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: "sm" | "md" | "lg";
}) {
  const [hovered, setHovered] = useState(0);
  const sz = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-7 h-7" : "w-5 h-5";

  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        const filled = s <= (hovered || value);
        return (
          <button
            key={s}
            type="button"
            aria-label={`${s} star${s > 1 ? "s" : ""}`}
            className={`${sz} transition-colors cursor-pointer ${filled ? "text-amber-400" : "text-stone-300 hover:text-amber-300"}`}
            onClick={() => onChange?.(s)}
            onMouseEnter={() => onChange && setHovered(s)}
            onMouseLeave={() => onChange && setHovered(0)}
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}
    </span>
  );
}

function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sz = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-7 h-7" : "w-5 h-5";
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`${sz} ${s <= rating ? "text-amber-400" : "text-stone-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

// ── Review form ───────────────────────────────────────────────────────────────

interface FormState {
  rating: number;
  title: string;
  body: string;
}

type FormErrors = { rating?: string; title?: string; body?: string };

function ReviewForm({
  productId,
  onSuccess,
}: {
  productId: string;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<FormState>({ rating: 0, title: "", body: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: FormErrors = {};
    if (!form.rating) errs.rating = "Please select a rating";
    if (!form.title.trim() || form.title.trim().length < 3) errs.title = "Title must be at least 3 characters";
    if (!form.body.trim() || form.body.trim().length < 10) errs.body = "Review must be at least 10 characters";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.status === 401) {
        setServerError("Please log in to submit a review.");
        return;
      }
      if (res.status === 409) {
        setServerError("You have already submitted a review for this product.");
        return;
      }
      const data = (await res.json()) as { errors?: FormErrors };
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        else setServerError("Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-sm text-emerald-800">
        <p className="font-semibold mb-1">Thank you for your review!</p>
        <p className="text-emerald-600">It will appear on this page once approved by our team.</p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      {serverError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          {serverError}
        </p>
      )}

      {/* Star rating */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">Your Rating</label>
        <StarPicker
          value={form.rating}
          onChange={(v) => setForm((f) => ({ ...f, rating: v }))}
          size="lg"
        />
        {errors.rating && <p className="mt-1 text-xs text-red-500">{errors.rating}</p>}
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="review-title">
          Review Title
        </label>
        <input
          id="review-title"
          type="text"
          maxLength={100}
          placeholder="Summarise your experience"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
      </div>

      {/* Body */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="review-body">
          Your Review
        </label>
        <textarea
          id="review-body"
          rows={4}
          maxLength={2000}
          placeholder="What did you think about this product?"
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
        />
        <div className="flex justify-between mt-1">
          {errors.body ? (
            <p className="text-xs text-red-500">{errors.body}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-stone-400">{form.body.length}/2000</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-2.5 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700 disabled:opacity-50 transition-colors cursor-pointer"
      >
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ReviewsSection({ productId, initialRating, initialCount }: Props) {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews?page=${p}`);
      if (res.ok) {
        const json = (await res.json()) as ReviewsData;
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void fetchReviews(page);
  }, [fetchReviews, page]);

  const displayRating = data ? (data.total > 0 ? (data.reviews.reduce((s, r) => s + r.rating, 0) / data.reviews.length) : initialRating) : initialRating;
  const displayCount = data?.total ?? initialCount;

  return (
    <div className="pt-10 border-t border-stone-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Customer Reviews</h2>
          {displayCount > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarDisplay rating={Math.round(displayRating)} size="md" />
              <span className="text-sm text-stone-500">
                {displayRating.toFixed(1)} · {displayCount} review{displayCount !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
        {!data?.myReview && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 text-sm font-medium border border-stone-300 rounded-xl hover:bg-stone-50 text-stone-700 transition-colors cursor-pointer"
          >
            {showForm ? "Cancel" : "Write a Review"}
          </button>
        )}
      </div>

      {/* My existing (pending) review notice */}
      {data?.myReview && !data.myReview.approved && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-medium">Your review is pending approval.</p>
          <p className="mt-0.5 text-amber-600">It will appear here once approved by our team.</p>
        </div>
      )}

      {/* Submit form */}
      {showForm && !data?.myReview && (
        <div className="mb-8 bg-stone-50 border border-stone-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-stone-700 mb-4">Write Your Review</h3>
          <ReviewForm
            productId={productId}
            onSuccess={() => {
              setShowForm(false);
              void fetchReviews(1);
            }}
          />
        </div>
      )}

      {/* Review list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-stone-100 rounded w-1/4 mb-2" />
              <div className="h-3 bg-stone-100 rounded w-full mb-1" />
              <div className="h-3 bg-stone-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : !data || data.reviews.length === 0 ? (
        <p className="text-sm text-stone-400 text-center py-8">
          No reviews yet. Be the first to share your experience.
        </p>
      ) : (
        <div className="space-y-6">
          {data.reviews.map((review) => (
            <div key={review.id} className="border-b border-stone-100 pb-6 last:border-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StarDisplay rating={review.rating} size="sm" />
                    <span className="text-sm font-semibold text-stone-800">{review.title}</span>
                  </div>
                  <p className="text-xs text-stone-400">
                    {review.user.name} ·{" "}
                    {new Date(review.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-stone-600 leading-relaxed">{review.body}</p>
            </div>
          ))}

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-stone-200 rounded-lg disabled:opacity-40 hover:bg-stone-50 cursor-pointer transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-stone-500">
                {page} / {data.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                disabled={page === data.pages}
                className="px-4 py-2 text-sm border border-stone-200 rounded-lg disabled:opacity-40 hover:bg-stone-50 cursor-pointer transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
