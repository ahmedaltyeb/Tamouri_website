"use client";

import { useEffect, useState, useCallback } from "react";

interface Review {
  id: string;
  rating: number;
  title: string;
  body: string;
  approved: boolean;
  createdAt: string;
  user: { id: string; name: string; email: string };
  product: { id: string; name: string };
}

type TabStatus = "pending" | "approved" | "all";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-4 h-4 ${s <= rating ? "text-amber-400" : "text-stone-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function parseProductName(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as { en?: string; ar?: string };
    return parsed.en || parsed.ar || raw;
  } catch {
    return raw;
  }
}

export default function AdminReviewsPage() {
  const [tab, setTab] = useState<TabStatus>("pending");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews?status=${tab}&page=${page}`);
      if (res.ok) {
        const data = (await res.json()) as {
          reviews: Review[];
          total: number;
          page: number;
          pages: number;
        };
        setReviews(data.reviews);
        setTotal(data.total);
        setPage(data.page);
        setPages(data.pages);
      }
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  // Reset to page 1 when tab changes
  useEffect(() => {
    setPage(1);
  }, [tab]);

  async function setApproved(id: string, approved: boolean) {
    setActionId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        setTotal((t) => t - 1);
      }
    } finally {
      setActionId(null);
    }
  }

  async function deleteReview(id: string) {
    if (!confirm("Delete this review permanently?")) return;
    setActionId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        setTotal((t) => t - 1);
      }
    } finally {
      setActionId(null);
    }
  }

  const tabs: { label: string; value: TabStatus }[] = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "All", value: "all" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Customer Reviews</h1>
        <p className="text-sm text-stone-500 mt-1">
          Approve or reject customer reviews before they appear on product pages.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-stone-200">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 text-sm font-medium rounded-t-md cursor-pointer transition-colors ${
              tab === t.value
                ? "bg-white border border-b-white border-stone-200 text-stone-900 -mb-px"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            {t.label}
          </button>
        ))}
        <span className="ml-auto self-center text-xs text-stone-400 pr-1">
          {total} review{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-stone-200 p-5 animate-pulse">
              <div className="h-4 bg-stone-100 rounded w-1/3 mb-3" />
              <div className="h-3 bg-stone-100 rounded w-1/2 mb-2" />
              <div className="h-3 bg-stone-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="font-medium">No {tab === "all" ? "" : tab} reviews</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl border border-stone-200 p-5 flex flex-col gap-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Stars rating={review.rating} />
                    <span className="text-sm font-semibold text-stone-800">{review.title}</span>
                    {review.approved && (
                      <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Approved
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400">
                    by{" "}
                    <span className="font-medium text-stone-600">{review.user.name}</span>
                    {" · "}
                    {review.user.email}
                    {" · "}
                    {parseProductName(review.product.name)}
                    {" · "}
                    {new Date(review.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {!review.approved ? (
                    <button
                      onClick={() => void setApproved(review.id, true)}
                      disabled={actionId === review.id}
                      className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 cursor-pointer transition-colors"
                    >
                      {actionId === review.id ? "…" : "Approve"}
                    </button>
                  ) : (
                    <button
                      onClick={() => void setApproved(review.id, false)}
                      disabled={actionId === review.id}
                      className="px-3 py-1.5 text-xs font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 cursor-pointer transition-colors"
                    >
                      {actionId === review.id ? "…" : "Unapprove"}
                    </button>
                  )}
                  <button
                    onClick={() => void deleteReview(review.id)}
                    disabled={actionId === review.id}
                    className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 cursor-pointer transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {/* Body */}
              <p className="text-sm text-stone-700 leading-relaxed">{review.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm border border-stone-200 rounded-lg disabled:opacity-40 hover:bg-stone-50 cursor-pointer transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-stone-500">
            Page {page} of {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-4 py-2 text-sm border border-stone-200 rounded-lg disabled:opacity-40 hover:bg-stone-50 cursor-pointer transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
