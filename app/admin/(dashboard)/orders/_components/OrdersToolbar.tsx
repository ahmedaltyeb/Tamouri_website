"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import type { OrderStatus } from "@prisma/client";

const STATUSES: { value: OrderStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PAID", label: "Paid" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function OrdersToolbar() {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const search = params.get("search") ?? "";
  const status = params.get("status") ?? "";

  const push = useCallback(
    (next: Record<string, string>) => {
      const sp = new URLSearchParams(params.toString());
      Object.entries(next).forEach(([k, v]) => {
        if (v) sp.set(k, v);
        else sp.delete(k);
      });
      startTransition(() => router.push(`/admin/orders?${sp.toString()}`));
    },
    [params, router],
  );

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <SearchIcon />
        <input
          type="text"
          placeholder="Search by order #, name, or email…"
          defaultValue={search}
          onChange={(e) => push({ search: e.target.value, page: "" })}
          className="w-full pl-9 pr-4 py-2 text-sm border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-300/50 focus:border-amber-400 transition-all bg-white"
        />
        {isPending && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => push({ status: s.value })}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors duration-150 cursor-pointer whitespace-nowrap ${
              status === s.value
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}
