"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@prisma/client";

// Defines the natural order of statuses for enabling quick actions
const STATUS_RANK: Record<OrderStatus, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PAID: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  CANCELLED: 99,
};

const ALL_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PAID", label: "Paid" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

const QUICK_ACTIONS: {
  status: OrderStatus;
  label: string;
  cls: string;
  activeCls: string;
}[] = [
  {
    status: "PAID",
    label: "Mark as Paid",
    cls: "border-teal-200 text-teal-700 hover:bg-teal-50",
    activeCls: "bg-teal-600 text-white hover:bg-teal-700",
  },
  {
    status: "SHIPPED",
    label: "Mark as Shipped",
    cls: "border-violet-200 text-violet-700 hover:bg-violet-50",
    activeCls: "bg-violet-600 text-white hover:bg-violet-700",
  },
  {
    status: "DELIVERED",
    label: "Mark as Delivered",
    cls: "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
    activeCls: "bg-emerald-600 text-white hover:bg-emerald-700",
  },
];

type Props = { orderId: string; currentStatus: OrderStatus };

export default function StatusUpdateForm({ orderId, currentStatus }: Props) {
  const [dropdownStatus, setDropdownStatus] = useState<OrderStatus>(currentStatus);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function patch(status: OrderStatus) {
    if (status === currentStatus) return;
    setError("");

    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Failed to update status");
      return;
    }
    router.refresh();
  }

  function handleQuickAction(status: OrderStatus) {
    startTransition(() => patch(status));
  }

  function handleDropdownSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => patch(dropdownStatus));
  }

  const isCancelled = currentStatus === "CANCELLED";

  return (
    <div className="space-y-3">
      {/* Quick action buttons */}
      {!isCancelled && (
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => {
            const isAlreadyPast = STATUS_RANK[currentStatus] >= STATUS_RANK[action.status];
            const isCurrent = currentStatus === action.status;
            return (
              <button
                key={action.status}
                type="button"
                disabled={isAlreadyPast || isPending}
                onClick={() => handleQuickAction(action.status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  isCurrent ? action.activeCls : action.cls
                }`}
              >
                {isCurrent ? `✓ ${action.label.replace("Mark as ", "")}` : action.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Full dropdown for any status */}
      <form onSubmit={handleDropdownSubmit} className="flex items-center gap-2">
        <select
          value={dropdownStatus}
          onChange={(e) => setDropdownStatus(e.target.value as OrderStatus)}
          disabled={isPending}
          className="text-sm border border-stone-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300/50 focus:border-amber-400 bg-white cursor-pointer disabled:opacity-50"
        >
          {ALL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={dropdownStatus === currentStatus || isPending}
          className="px-3 py-2 text-sm font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer whitespace-nowrap"
        >
          {isPending ? "Saving…" : "Update"}
        </button>
      </form>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
