import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";
import StatusBadge from "./_components/StatusBadge";
import OrdersToolbar from "./_components/OrdersToolbar";

export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set<string>([
  "PENDING",
  "CONFIRMED",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

type PageProps = {
  searchParams: Promise<{ search?: string; status?: string }>;
};

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const { search = "", status: rawStatus = "" } = await searchParams;
  const status =
    rawStatus && VALID_STATUSES.has(rawStatus)
      ? (rawStatus as OrderStatus)
      : undefined;

  const orders = await prisma.order.findMany({
    where: {
      AND: [
        status ? { status } : {},
        search.trim()
          ? {
              OR: [
                { id: { contains: search, mode: "insensitive" } },
                { user: { name: { contains: search, mode: "insensitive" } } },
                { user: { email: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {},
      ],
    },
    include: {
      user: true,
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Orders</h1>
        <p className="text-sm text-stone-500 mt-0.5">
          {orders.length} {status ? status.toLowerCase() : "total"} order
          {orders.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Toolbar: search + filter */}
      <div className="mb-6">
        <Suspense fallback={<div className="h-10 bg-stone-100 rounded-lg animate-pulse" />}>
          <OrdersToolbar />
        </Suspense>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50 text-left">
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wide">
                  Order
                </th>
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wide">
                  Customer
                </th>
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wide">
                  Date
                </th>
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wide">
                  Items
                </th>
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wide">
                  Total
                </th>
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-stone-50 transition-colors duration-100"
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-stone-700 bg-stone-100 px-2 py-1 rounded">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-900 leading-snug">
                      {order.user.name}
                    </p>
                    <p className="text-xs text-stone-400">{order.user.email}</p>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-xs text-stone-500">
                    {new Date(order.createdAt).toLocaleDateString("en-AE", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  <td className="px-4 py-3 text-stone-600 text-xs">
                    {order._count.items} item{order._count.items !== 1 ? "s" : ""}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap font-semibold text-stone-800">
                    {order.total.toFixed(2)} AED
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>

                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="px-3 py-1.5 text-xs font-medium text-stone-600 border border-stone-200 rounded-lg hover:border-amber-300 hover:text-amber-700 transition-colors duration-150 cursor-pointer"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <p className="text-stone-400 text-sm">
                      {search || status
                        ? "No orders match your filters."
                        : "No orders yet."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
