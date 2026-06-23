"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { categories } from "@/lib/products";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;
const PLACEHOLDER = "/placeholder.svg";

type FormProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  categorySlug: string;
  image: string;
  images?: string[];
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
  category: "Dates",
  badge: "",
  rating: "0",
  reviews: "0",
  inStock: true,
  stock: "0",
};

export default function ProductForm({ mode, product }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(
    product
      ? {
          name: product.name,
          description: product.description,
          price: String(product.price),
          originalPrice: product.originalPrice ? String(product.originalPrice) : "",
          categorySlug: product.categorySlug,
          category: product.category,
          badge: product.badge ?? "",
          rating: String(product.rating),
          reviews: String(product.reviews),
          inStock: product.inStock,
          stock: String(product.stock),
        }
      : DEFAULTS,
  );

  // Image list — existing products use images[] if available, else fall back to [image]
  const initialImages =
    product?.images?.length
      ? product.images
      : product?.image
      ? [product.image]
      : [];

  const [images, setImages] = useState<string[]>(initialImages);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Local gallery
  const [localImages, setLocalImages] = useState<string[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/local-images")
      .then((r) => r.json())
      .then((d: { images: string[] }) => setLocalImages(d.images))
      .catch(() => {});
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────

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

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setUploadError("");

    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setUploadError("Only JPG, PNG, and WebP images are allowed.");
        continue;
      }
      if (file.size > MAX_BYTES) {
        setUploadError("Each image must be under 5 MB.");
        continue;
      }

      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };

      if (res.ok && data.url) {
        setImages((prev) => [...prev, data.url!]);
      } else {
        setUploadError(data.error ?? "Upload failed.");
      }
    }
    setUploading(false);
    // reset file input so the same file can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function addUrl() {
    const url = urlInput.trim();
    if (!url) return;
    setImages((prev) => [...prev, url]);
    setUrlInput("");
    setUploadError("");
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function makePrimary(idx: number) {
    if (idx === 0) return;
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      return [item, ...next];
    });
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);

    if (images.length === 0) {
      setErrors(["At least one product image is required."]);
      return;
    }

    setLoading(true);

    const body = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
      category: form.category,
      categorySlug: form.categorySlug,
      image: images[0],
      images,
      badge: form.badge.trim() || null,
      rating: parseFloat(form.rating) || 0,
      reviews: parseInt(form.reviews, 10) || 0,
      inStock: form.inStock,
      stock: parseInt(form.stock, 10) || 0,
    };

    try {
      const url =
        mode === "create" ? "/api/admin/products" : `/api/admin/products/${product!.id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
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

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-red-700 mb-2">Please fix these errors:</p>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((err, i) => (
              <li key={i} className="text-sm text-red-600">{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: main info + images ── */}
        <div className="lg:col-span-2 space-y-5">

          <Card title="Product Information">
            <Field label="Product Name *" htmlFor="name">
              <input
                id="name" name="name" type="text"
                value={form.name} onChange={handleChange}
                placeholder="e.g. تمر مجدول فاخر"
                className={input} required
              />
            </Field>
            <Field label="Description *" htmlFor="description">
              <textarea
                id="description" name="description"
                value={form.description} onChange={handleChange}
                rows={4} placeholder="Product description…"
                className={`${input} resize-none`} required
              />
            </Field>
          </Card>

          {/* ── Image Management ── */}
          <Card title="Product Images">

            {/* Current images grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                {images.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <div className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-colors ${
                      idx === 0 ? "border-amber-400 ring-2 ring-amber-200" : "border-stone-200"
                    }`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Product image ${idx + 1}`}
                        className="w-full h-full object-contain p-1"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PLACEHOLDER;
                        }}
                      />
                    </div>

                    {/* Primary badge */}
                    {idx === 0 && (
                      <span className="absolute top-1 start-1 text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-md leading-none">
                        PRIMARY
                      </span>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => makePrimary(idx)}
                          title="Set as primary"
                          className="w-7 h-7 bg-white rounded-full flex items-center justify-center hover:bg-amber-50 transition-colors cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        title="Remove image"
                        className="w-7 h-7 bg-white rounded-full flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {images.length === 0 && (
              <div className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center mb-4">
                <svg className="w-10 h-10 text-stone-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <p className="text-sm text-stone-400">No images yet — upload or paste a URL below</p>
              </div>
            )}

            {/* ── Local Gallery Picker ── */}
            {localImages.length > 0 && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setGalleryOpen(!galleryOpen)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer mb-2"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    Pick from Local Gallery ({localImages.length} images)
                  </span>
                  <svg className={`w-4 h-4 transition-transform ${galleryOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {galleryOpen && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-3 bg-stone-50 border border-stone-200 rounded-xl">
                    {localImages.map((src) => {
                      const alreadyAdded = images.includes(src);
                      return (
                        <button
                          key={src}
                          type="button"
                          onClick={() => {
                            if (!alreadyAdded) setImages((prev) => [...prev, src]);
                          }}
                          title={alreadyAdded ? "Already added" : "Click to add"}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer group ${
                            alreadyAdded
                              ? "border-amber-400 ring-2 ring-amber-200 opacity-60 cursor-not-allowed"
                              : "border-stone-200 hover:border-blue-400 hover:shadow-md"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {/* BUG FIX #8: add lazy loading for gallery picker thumbnails */}
                          <img
                            src={src}
                            alt={src}
                            className="w-full h-full object-contain p-1 bg-white"
                            loading="lazy"
                          />
                          {alreadyAdded ? (
                            <div className="absolute inset-0 bg-amber-400/20 flex items-center justify-center">
                              <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd"/>
                              </svg>
                            </div>
                          ) : (
                            <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Upload from file */}
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-amber-300 rounded-xl text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                    </svg>
                    Uploading…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                    </svg>
                    Upload Images (JPG / PNG / WebP, max 5 MB each)
                  </>
                )}
              </button>

              {/* Paste URL */}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
                  placeholder="Or paste an image URL and press Add →"
                  className={`${input} flex-1`}
                />
                <button
                  type="button"
                  onClick={addUrl}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  Add
                </button>
              </div>

              {uploadError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {uploadError}
                </p>
              )}

              <p className="text-xs text-stone-400">
                First image = primary (shown in listings). Hover an image to reorder or remove.
              </p>
            </div>
          </Card>
        </div>

        {/* ── RIGHT: pricing + meta ── */}
        <div className="space-y-5">
          <Card title="Pricing">
            <Field label="Price (AED) *" htmlFor="price">
              <input
                id="price" name="price" type="number"
                min="0.01" step="0.01" value={form.price}
                onChange={handleChange} placeholder="0.00"
                className={input} required
              />
            </Field>
            <Field label="Original Price (AED)" htmlFor="originalPrice">
              <input
                id="originalPrice" name="originalPrice" type="number"
                min="0.01" step="0.01" value={form.originalPrice}
                onChange={handleChange} placeholder="Leave blank if no discount"
                className={input}
              />
            </Field>
          </Card>

          <Card title="Category & Details">
            <Field label="Category *" htmlFor="categorySlug">
              <select
                id="categorySlug" name="categorySlug"
                value={form.categorySlug} onChange={handleChange}
                className={input} required
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Badge" htmlFor="badge">
              <input
                id="badge" name="badge" type="text"
                value={form.badge} onChange={handleChange}
                placeholder="e.g. الأكثر مبيعاً"
                className={input}
              />
            </Field>

            <Field label="Rating (0–5)" htmlFor="rating">
              <input
                id="rating" name="rating" type="number"
                min="0" max="5" step="0.1" value={form.rating}
                onChange={handleChange} className={input}
              />
            </Field>

            <Field label="Review Count" htmlFor="reviews">
              <input
                id="reviews" name="reviews" type="number"
                min="0" step="1" value={form.reviews}
                onChange={handleChange} className={input}
              />
            </Field>

            <Field label="Stock Quantity" htmlFor="stock">
              <input
                id="stock" name="stock" type="number"
                min="0" step="1" value={form.stock}
                onChange={handleChange} placeholder="0"
                className={input}
              />
            </Field>

            <div className="flex items-center gap-2.5 pt-1">
              <input
                id="inStock" name="inStock" type="checkbox"
                checked={form.inStock} onChange={handleChange}
                className="w-4 h-4 rounded border-stone-300 accent-amber-600 cursor-pointer"
              />
              <label htmlFor="inStock" className="text-sm font-medium text-stone-700 cursor-pointer select-none">
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
          disabled={loading || uploading}
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
        {images.length > 0 && (
          <span className="text-xs text-stone-400 ms-2">
            {images.length} image{images.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </form>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
      <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
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
