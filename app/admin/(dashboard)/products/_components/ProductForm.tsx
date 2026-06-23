"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { categories } from "@/lib/products";

type FormProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  categorySlug: string;
  image: string;
  badge?: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  stock: number;
};

type Props = {
  mode: "create" | "edit";
  product?: FormProduct;
};

const DEFAULTS = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  categorySlug: "dates",
  category: "التمر",
  image: "",
  badge: "",
  rating: "0",
  reviews: "0",
  inStock: true,
  stock: "0",
};

export default function ProductForm({ mode, product }: Props) {
  const router = useRouter();

  const [form, setForm] = useState(
    product
      ? {
          name: product.name,
          description: product.description,
          price: String(product.price),
          originalPrice: product.originalPrice ? String(product.originalPrice) : "",
          categorySlug: product.categorySlug,
          category: product.category,
          image: product.image,
          badge: product.badge ?? "",
          rating: String(product.rating),
          reviews: String(product.reviews),
          inStock: product.inStock,
          stock: String(product.stock),
        }
      : DEFAULTS,
  );

  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((f) => ({ ...f, [name]: (e.target as HTMLInputElement).checked }));
    } else if (name === "categorySlug") {
      const cat = categories.find((c) => c.slug === value);
      setForm((f) => ({ ...f, categorySlug: value, category: cat?.name ?? value }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    const body = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
      category: form.category,
      categorySlug: form.categorySlug,
      image: form.image.trim(),
      badge: form.badge.trim() || null,
      rating: parseFloat(form.rating) || 0,
      reviews: parseInt(form.reviews, 10) || 0,
      inStock: form.inStock,
      stock: parseInt(form.stock, 10) || 0,
    };

    try {
      const url =
        mode === "create" ? "/api/admin/products" : `/api/admin/products/${product!.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = (await res.json()) as { errors?: string[]; error?: string };
      if (!res.ok) {
        setErrors(data.errors ?? [data.error ?? "Something went wrong"]);
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setErrors(["Network error — please try again."]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-red-700 mb-2">Please fix these errors:</p>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((err, i) => (
              <li key={i} className="text-sm text-red-600">
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — main info */}
        <div className="lg:col-span-2 space-y-5">
          <Card title="Product Information">
            <Field label="Product Name *" htmlFor="name">
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. تمر مجدول فاخر"
                className={input}
                required
              />
            </Field>

            <Field label="Description *" htmlFor="description">
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Product description in Arabic or English…"
                className={`${input} resize-none`}
                required
              />
            </Field>

            <Field label="Image URL *" htmlFor="image">
              <input
                id="image"
                name="image"
                type="url"
                value={form.image}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/…"
                className={input}
                required
              />
              {form.image && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={form.image}
                    alt="Preview"
                    className="w-20 h-20 rounded-lg object-cover border border-stone-200 bg-stone-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <p className="text-xs text-stone-400">Image preview</p>
                </div>
              )}
            </Field>
          </Card>
        </div>

        {/* Right — pricing + meta */}
        <div className="space-y-5">
          <Card title="Pricing">
            <Field label="Price (AED) *" htmlFor="price">
              <input
                id="price"
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                className={input}
                required
              />
            </Field>

            <Field label="Original Price (AED)" htmlFor="originalPrice">
              <input
                id="originalPrice"
                name="originalPrice"
                type="number"
                min="0.01"
                step="0.01"
                value={form.originalPrice}
                onChange={handleChange}
                placeholder="Leave blank if no discount"
                className={input}
              />
            </Field>
          </Card>

          <Card title="Category & Details">
            <Field label="Category *" htmlFor="categorySlug">
              <select
                id="categorySlug"
                name="categorySlug"
                value={form.categorySlug}
                onChange={handleChange}
                className={input}
                required
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Badge" htmlFor="badge">
              <input
                id="badge"
                name="badge"
                type="text"
                value={form.badge}
                onChange={handleChange}
                placeholder="e.g. الأكثر مبيعاً"
                className={input}
              />
            </Field>

            <Field label="Rating (0–5)" htmlFor="rating">
              <input
                id="rating"
                name="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={handleChange}
                className={input}
              />
            </Field>

            <Field label="Review Count" htmlFor="reviews">
              <input
                id="reviews"
                name="reviews"
                type="number"
                min="0"
                step="1"
                value={form.reviews}
                onChange={handleChange}
                className={input}
              />
            </Field>

            <Field label="Stock Quantity" htmlFor="stock">
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={handleChange}
                placeholder="0"
                className={input}
              />
            </Field>

            <div className="flex items-center gap-2.5 pt-1">
              <input
                id="inStock"
                name="inStock"
                type="checkbox"
                checked={form.inStock}
                onChange={handleChange}
                className="w-4 h-4 rounded border-stone-300 accent-amber-600 cursor-pointer"
              />
              <label
                htmlFor="inStock"
                className="text-sm font-medium text-stone-700 cursor-pointer select-none"
              >
                Available for sale
              </label>
            </div>
          </Card>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition-colors duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Saving…" : mode === "create" ? "Create Product" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="px-6 py-2.5 text-sm font-medium text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors duration-150 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
      <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-stone-700 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

const input =
  "w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-colors duration-150";
