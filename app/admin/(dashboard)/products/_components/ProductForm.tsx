"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { categories } from "@/lib/products";

const PLACEHOLDER = "/placeholder.svg";

type MLText = { en: string; ar: string };

type FormProduct = {
  id: string;
  name: MLText;
  description: MLText;
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
  nameEn: "",
  nameAr: "",
  descriptionEn: "",
  descriptionAr: "",
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

  const [langTab, setLangTab] = useState<"en" | "ar">("en");

  const [form, setForm] = useState(
    product
      ? {
          nameEn: product.name.en,
          nameAr: product.name.ar,
          descriptionEn: product.description.en,
          descriptionAr: product.description.ar,
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

  const initialImages =
    product?.images?.length ? product.images : product?.image ? [product.image] : [];

  const [images, setImages] = useState<string[]>(initialImages);
  const [urlInput, setUrlInput] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // ── File upload ──────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // ── Local gallery ────────────────────────────────────────────
  const [localImages, setLocalImages] = useState<string[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [gallerySearch, setGallerySearch] = useState("");

  // ── Preview modal ────────────────────────────────────────────
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  // ── Drag-and-drop reorder ────────────────────────────────────
  const dragIdx = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/local-images")
      .then((r) => r.json())
      .then((d: { images: string[] }) => setLocalImages(d.images))
      .catch(() => {});
  }, []);

  // ── Helpers ──────────────────────────────────────────────────

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

    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { urls?: string[]; error?: string; errors?: string[] };
      if (res.ok && data.urls?.length) {
        setImages((prev) => {
          const next = [...prev];
          for (const url of data.urls!) {
            if (!next.includes(url)) next.push(url);
          }
          return next;
        });
        // Refresh gallery so newly uploaded files appear in the picker
        fetch("/api/admin/local-images")
          .then((r) => r.json())
          .then((d: { images: string[] }) => setLocalImages(d.images))
          .catch(() => {});
      } else {
        setUploadError(data.error ?? data.errors?.[0] ?? "Upload failed.");
      }
    } catch {
      setUploadError("Network error. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function addUrl() {
    const url = urlInput.trim();
    if (!url) return;
    if (images.includes(url)) return;
    setImages((prev) => [...prev, url]);
    setUrlInput("");
  }

  function makePrimary(idx: number) {
    if (idx === 0) return;
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      return [item, ...next];
    });
  }

  function removeImage(idx: number) {
    const name = images[idx].split("/").pop() ?? "this image";
    if (!confirm(`Remove "${name}" from the product?`)) return;
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function addFromGallery(src: string) {
    if (!images.includes(src)) setImages((prev) => [...prev, src]);
  }

  // ── Drag-and-drop handlers ───────────────────────────────────
  const onDragStart = useCallback((idx: number) => {
    dragIdx.current = idx;
  }, []);

  const onDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOver(idx);
  }, []);

  const onDrop = useCallback((e: React.DragEvent, toIdx: number) => {
    e.preventDefault();
    const fromIdx = dragIdx.current;
    if (fromIdx === null || fromIdx === toIdx) {
      dragIdx.current = null;
      setDragOver(null);
      return;
    }
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      return next;
    });
    dragIdx.current = null;
    setDragOver(null);
  }, []);

  const onDragEnd = useCallback(() => {
    dragIdx.current = null;
    setDragOver(null);
  }, []);

  // ── Filtered gallery list ────────────────────────────────────
  const filteredGallery = gallerySearch.trim()
    ? localImages.filter((src) =>
        src.toLowerCase().includes(gallerySearch.toLowerCase()),
      )
    : localImages;

  // ── Submit ───────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);

    if (images.length === 0) {
      setErrors(["At least one product image is required."]);
      return;
    }

    const nameErrors: string[] = [];
    if (!form.nameEn.trim()) nameErrors.push("English name is required.");
    if (!form.nameAr.trim()) nameErrors.push("Arabic name is required.");
    if (!form.descriptionEn.trim()) nameErrors.push("English description is required.");
    if (!form.descriptionAr.trim()) nameErrors.push("Arabic description is required.");
    if (nameErrors.length) { setErrors(nameErrors); return; }

    setLoading(true);
    const body = {
      name: { en: form.nameEn.trim(), ar: form.nameAr.trim() },
      description: { en: form.descriptionEn.trim(), ar: form.descriptionAr.trim() },
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

  // ── Render ───────────────────────────────────────────────────
  return (
    <>
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
          {/* ── LEFT: info + images ── */}
          <div className="lg:col-span-2 space-y-5">

            <Card title="Product Information">
              {/* Language tabs */}
              <div className="flex gap-1 mb-4 p-1 bg-stone-100 rounded-lg w-fit">
                <button
                  type="button"
                  onClick={() => setLangTab("en")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    langTab === "en"
                      ? "bg-white text-stone-800 shadow-sm"
                      : "text-stone-500 hover:text-stone-700"
                  }`}
                >
                  <span>🇬🇧</span> English
                  {(!form.nameEn || !form.descriptionEn) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-none" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setLangTab("ar")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    langTab === "ar"
                      ? "bg-white text-stone-800 shadow-sm"
                      : "text-stone-500 hover:text-stone-700"
                  }`}
                >
                  <span>🇸🇦</span> العربية
                  {(!form.nameAr || !form.descriptionAr) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-none" />
                  )}
                </button>
              </div>

              {langTab === "en" && (
                <>
                  <Field label="Product Name — English *" htmlFor="nameEn">
                    <input
                      id="nameEn" name="nameEn" type="text"
                      value={form.nameEn}
                      onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))}
                      placeholder="e.g. Premium Medjool Dates"
                      className={inputCls}
                      dir="ltr"
                    />
                  </Field>
                  <Field label="Description — English *" htmlFor="descriptionEn">
                    <textarea
                      id="descriptionEn" name="descriptionEn"
                      value={form.descriptionEn}
                      onChange={(e) => setForm((f) => ({ ...f, descriptionEn: e.target.value }))}
                      rows={4} placeholder="Product description in English…"
                      className={`${inputCls} resize-none`}
                      dir="ltr"
                    />
                  </Field>
                </>
              )}

              {langTab === "ar" && (
                <>
                  <Field label="اسم المنتج — العربية *" htmlFor="nameAr">
                    <input
                      id="nameAr" name="nameAr" type="text"
                      value={form.nameAr}
                      onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
                      placeholder="مثال: تمر مجدول فاخر"
                      className={inputCls}
                      dir="rtl"
                    />
                  </Field>
                  <Field label="الوصف — العربية *" htmlFor="descriptionAr">
                    <textarea
                      id="descriptionAr" name="descriptionAr"
                      value={form.descriptionAr}
                      onChange={(e) => setForm((f) => ({ ...f, descriptionAr: e.target.value }))}
                      rows={4} placeholder="وصف المنتج بالعربية…"
                      className={`${inputCls} resize-none`}
                      dir="rtl"
                    />
                  </Field>
                </>
              )}
            </Card>

            {/* ── Image Management ── */}
            <Card title="Product Images">

              {/* Empty state */}
              {images.length === 0 && (
                <div className="border-2 border-dashed border-stone-200 rounded-xl p-10 text-center mb-4">
                  <svg className="w-10 h-10 text-stone-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <p className="text-sm text-stone-400">No images yet — pick from gallery or paste a URL below</p>
                </div>
              )}

              {/* Image grid — drag-and-drop enabled */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                  {images.map((url, idx) => (
                    <div
                      key={url + idx}
                      draggable
                      onDragStart={() => onDragStart(idx)}
                      onDragOver={(e) => onDragOver(e, idx)}
                      onDrop={(e) => onDrop(e, idx)}
                      onDragEnd={onDragEnd}
                      className={`relative group cursor-grab active:cursor-grabbing transition-all duration-150 ${
                        dragOver === idx ? "scale-105 ring-2 ring-amber-400 ring-offset-1 rounded-xl" : ""
                      }`}
                    >
                      {/* Thumbnail */}
                      <div
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-colors ${
                          idx === 0
                            ? "border-amber-400 ring-2 ring-amber-200"
                            : "border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Product image ${idx + 1}`}
                          className="w-full h-full object-contain p-1 bg-white"
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                        />

                        {/* Hover overlay */}
                        <div className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          {/* Preview */}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setPreviewSrc(url); }}
                            title="Preview"
                            className="w-7 h-7 bg-white rounded-full flex items-center justify-center hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                          </button>
                          {/* Make primary */}
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); makePrimary(idx); }}
                              title="Set as primary"
                              className="w-7 h-7 bg-white rounded-full flex items-center justify-center hover:bg-amber-50 transition-colors cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                              </svg>
                            </button>
                          )}
                          {/* Remove */}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                            title="Remove image"
                            className="w-7 h-7 bg-white rounded-full flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Primary badge */}
                      {idx === 0 && (
                        <span className="absolute top-1.5 start-1.5 text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-md leading-none shadow-sm pointer-events-none">
                          PRIMARY
                        </span>
                      )}

                      {/* Drag handle hint */}
                      <span className="absolute top-1.5 end-1.5 opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none">
                        <svg className="w-3.5 h-3.5 text-white drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M7 2a2 2 0 110 4 2 2 0 010-4zm6 0a2 2 0 110 4 2 2 0 010-4zM7 8a2 2 0 110 4 2 2 0 010-4zm6 0a2 2 0 110 4 2 2 0 010-4zm-6 6a2 2 0 110 4 2 2 0 010-4zm6 0a2 2 0 110 4 2 2 0 010-4z"/>
                        </svg>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {images.length > 1 && (
                <p className="text-xs text-stone-400 mb-4 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                  </svg>
                  Drag images to reorder · first image = primary
                </p>
              )}

              {/* ── Upload from device ── */}
              <div className="mb-4">
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
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-amber-300 rounded-xl text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
                      Upload Images  ·  JPG / PNG / WebP  ·  max 5 MB each
                    </>
                  )}
                </button>
                {uploadError && (
                  <p className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {uploadError}
                  </p>
                )}
              </div>

              {/* ── Local Gallery Picker ── */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setGalleryOpen(!galleryOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    Local Gallery
                    <span className="text-xs font-normal text-blue-500">
                      ({localImages.length} images{images.length > 0 ? ` · ${images.length} selected` : ""})
                    </span>
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${galleryOpen ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {galleryOpen && (
                  <div className="mt-2 border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                    {/* Search */}
                    <div className="px-3 py-2.5 bg-stone-50 border-b border-stone-200">
                      <div className="relative">
                        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <input
                          type="text"
                          placeholder="Search images…"
                          value={gallerySearch}
                          onChange={(e) => setGallerySearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs border border-stone-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-200"
                        />
                        {gallerySearch && (
                          <button
                            type="button"
                            onClick={() => setGallerySearch("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {filteredGallery.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-stone-400">
                        {gallerySearch ? `No images matching "${gallerySearch}"` : "No images in /public/products"}
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-0 p-3 gap-2.5 bg-stone-50 max-h-80 overflow-y-auto">
                        {filteredGallery.map((src) => {
                          const isSelected = images.includes(src);
                          const filename = src.split("/").pop() ?? src;
                          const label = filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
                          return (
                            <button
                              key={src}
                              type="button"
                              onClick={() => addFromGallery(src)}
                              title={isSelected ? "Already added" : `Add: ${filename}`}
                              className={`relative flex flex-col rounded-xl overflow-hidden border-2 transition-all cursor-pointer group text-left ${
                                isSelected
                                  ? "border-amber-400 ring-2 ring-amber-200"
                                  : "border-stone-200 hover:border-blue-400 hover:shadow-md bg-white"
                              }`}
                            >
                              {/* Thumbnail */}
                              <div className="aspect-square w-full overflow-hidden bg-white">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={src}
                                  alt={label}
                                  className="w-full h-full object-contain p-1"
                                  loading="lazy"
                                />
                              </div>

                              {/* Filename label */}
                              <div className={`px-1.5 py-1 text-center ${isSelected ? "bg-amber-50" : "bg-stone-50"}`}>
                                <p className="text-[9px] leading-tight font-medium truncate text-stone-600">
                                  {label}
                                </p>
                              </div>

                              {/* Selected overlay */}
                              {isSelected && (
                                <div className="absolute inset-0 bg-amber-400/15 flex items-start justify-end p-1.5 pointer-events-none">
                                  <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow-sm">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd"/>
                                    </svg>
                                  </div>
                                </div>
                              )}

                              {/* Hover add indicator */}
                              {!isSelected && (
                                <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
                                    </svg>
                                  </div>
                                </div>
                              )}

                              {/* Preview button */}
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setPreviewSrc(src); }}
                                className="absolute bottom-7 end-1 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 bg-white/90 border border-stone-200 rounded-md flex items-center justify-center hover:bg-white shadow-sm cursor-pointer"
                                title="Preview full size"
                              >
                                <svg className="w-3 h-3 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                </svg>
                              </button>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="px-3 py-2 bg-stone-50 border-t border-stone-200 text-xs text-stone-400">
                      {filteredGallery.length} image{filteredGallery.length !== 1 ? "s" : ""}
                      {gallerySearch ? ` matching "${gallerySearch}"` : " in /public/products"}
                      {" · "}Add images to the folder and refresh the page to see them here.
                    </div>
                  </div>
                )}
              </div>

              {/* ── URL input ── */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
                    placeholder="Paste an image URL and press Add →"
                    className={`${inputCls} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={addUrl}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Add
                  </button>
                </div>
                <p className="text-xs text-stone-400">
                  First image = primary (shown in listings). Drag to reorder. Hover to preview, set primary, or remove.
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
                  className={inputCls} required
                />
              </Field>
              <Field label="Original Price (AED)" htmlFor="originalPrice">
                <input
                  id="originalPrice" name="originalPrice" type="number"
                  min="0.01" step="0.01" value={form.originalPrice}
                  onChange={handleChange} placeholder="Leave blank if no discount"
                  className={inputCls}
                />
              </Field>
            </Card>

            <Card title="Category & Details">
              <Field label="Category *" htmlFor="categorySlug">
                <select
                  id="categorySlug" name="categorySlug"
                  value={form.categorySlug} onChange={handleChange}
                  className={inputCls} required
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
                  className={inputCls}
                />
              </Field>

              <Field label="Rating (0–5)" htmlFor="rating">
                <input
                  id="rating" name="rating" type="number"
                  min="0" max="5" step="0.1" value={form.rating}
                  onChange={handleChange} className={inputCls}
                />
              </Field>

              <Field label="Review Count" htmlFor="reviews">
                <input
                  id="reviews" name="reviews" type="number"
                  min="0" step="1" value={form.reviews}
                  onChange={handleChange} className={inputCls}
                />
              </Field>

              <Field label="Stock Quantity" htmlFor="stock">
                <input
                  id="stock" name="stock" type="number"
                  min="0" step="1" value={form.stock}
                  onChange={handleChange} placeholder="0"
                  className={inputCls}
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

            {/* Image count summary */}
            {images.length > 0 && (
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Images</p>
                <p className="text-sm text-stone-700">
                  <span className="font-bold text-stone-900">{images.length}</span> image{images.length !== 1 ? "s" : ""} added
                </p>
                <p className="text-xs text-stone-400 mt-1 truncate">Primary: {images[0].split("/").pop()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-6 py-2.5 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition-colors duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Saving…" : uploading ? "Uploading…" : mode === "create" ? "Create Product" : "Save Changes"}
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

      {/* ── Image Preview Modal ── */}
      {previewSrc && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewSrc(null)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
              <p className="text-sm font-medium text-stone-600 truncate">
                {previewSrc.split("/").pop()}
              </p>
              <button
                type="button"
                onClick={() => setPreviewSrc(null)}
                className="text-stone-400 hover:text-stone-700 transition-colors cursor-pointer p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Image */}
            <div className="flex items-center justify-center bg-stone-50 p-6" style={{ minHeight: 300 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc}
                alt="Preview"
                className="max-w-full max-h-[60vh] object-contain rounded-lg"
                onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
              />
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100 gap-2">
              <div className="flex gap-2">
                {!images.includes(previewSrc) ? (
                  <button
                    type="button"
                    onClick={() => { addFromGallery(previewSrc); setPreviewSrc(null); }}
                    className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    + Add to Product
                  </button>
                ) : (
                  <span className="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg border border-amber-200">
                    ✓ Added
                  </span>
                )}
                {images.includes(previewSrc) && images[0] !== previewSrc && (
                  <button
                    type="button"
                    onClick={() => { makePrimary(images.indexOf(previewSrc)); setPreviewSrc(null); }}
                    className="px-4 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition-colors cursor-pointer"
                  >
                    ★ Set as Primary
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPreviewSrc(null)}
                className="px-4 py-1.5 text-xs text-stone-500 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────

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

const inputCls =
  "w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-colors duration-150";
