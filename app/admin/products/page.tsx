import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "./_components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Products</h1>
          <p className="text-sm text-stone-500 mt-0.5">{products.length} products in database</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition-colors duration-150 cursor-pointer"
        >
          <PlusIcon />
          Add Product
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50 text-left">
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wide">
                  Product
                </th>
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wide">
                  Category
                </th>
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wide">
                  Price
                </th>
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wide">
                  Stock
                </th>
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wide">
                  Badge
                </th>
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wide">
                  Rating
                </th>
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50 transition-colors duration-100">
                  {/* Product name + image */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-stone-100"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-stone-900 leading-snug">{p.name}</p>
                        <p className="text-xs text-stone-400 truncate max-w-[220px]">
                          {p.description.slice(0, 55)}…
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      {p.categorySlug}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-semibold text-stone-800">{p.price} AED</span>
                    {p.originalPrice && (
                      <span className="block text-xs text-stone-400 line-through">
                        {p.originalPrice} AED
                      </span>
                    )}
                  </td>

                  {/* Stock */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        p.inStock ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          p.inStock ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      />
                      {p.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>

                  {/* Badge */}
                  <td className="px-4 py-3 text-xs text-stone-500">{p.badge ?? "—"}</td>

                  {/* Rating */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-amber-500">★</span>{" "}
                    <span className="text-stone-700 font-medium">{p.rating.toFixed(1)}</span>
                    <span className="text-stone-400 text-xs ml-1">({p.reviews})</span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="px-3 py-1.5 text-xs font-medium text-stone-600 border border-stone-200 rounded-lg hover:border-amber-300 hover:text-amber-700 transition-colors duration-150 cursor-pointer"
                      >
                        Edit
                      </Link>
                      <DeleteButton productId={p.id} productName={p.name} />
                    </div>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <p className="text-stone-400 text-sm">No products yet.</p>
                    <Link
                      href="/admin/products/new"
                      className="text-amber-600 hover:underline text-sm mt-1 inline-block"
                    >
                      Add your first product
                    </Link>
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

function PlusIcon() {
  return (
    <svg
      className="w-4 h-4 flex-shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
