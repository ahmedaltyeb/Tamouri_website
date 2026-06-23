"use client";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { categories } from "@/lib/products";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProducts } from "@/hooks/useProducts";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-stone-100" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-stone-100 rounded w-2/3" />
        <div className="h-4 bg-stone-100 rounded w-full" />
        <div className="h-4 bg-stone-100 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function ShopContent() {
  const { tr } = useLanguage();
  const searchParams = useSearchParams();
  const { products, loading } = useProducts();

  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") ?? "all"
  );
  const [sortBy, setSortBy] = useState("default");
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  const filtered = useMemo(() => {
    let result = [...products];

    if (activeCategory !== "all") {
      result = result.filter((p) => p.categorySlug === activeCategory);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (sortBy === "price-asc") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") result.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);

    return result;
  }, [products, activeCategory, sortBy, search]);

  return (
    <div>
      {/* Hero strip */}
      <div className="bg-gradient-to-l from-brown to-brown-dark text-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black mb-1">{tr("shopPageTitle")}</h1>
          <p className="text-white/70 text-sm">{tr("shopPageSub")}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={tr("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-brown/20 focus:border-brown transition-all"
            />
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brown/20 cursor-pointer min-w-[160px]"
          >
            <option value="default">{tr("sortDefault")}</option>
            <option value="price-asc">{tr("sortPriceAsc")}</option>
            <option value="price-desc">{tr("sortPriceDesc")}</option>
            <option value="rating">{tr("sortRating")}</option>
          </select>
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          <button
            onClick={() => setActiveCategory("all")}
            className={`flex-none px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === "all"
                ? "bg-brown text-white shadow-sm"
                : "bg-white border border-stone-200 text-stone-600 hover:border-brown hover:text-brown"
            }`}
          >
            {tr("all")} ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.categorySlug === cat.slug).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`flex-none px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === cat.slug
                    ? "bg-brown text-white shadow-sm"
                    : "bg-white border border-stone-200 text-stone-600 hover:border-brown hover:text-brown"
                }`}
              >
                {tr(cat.nameKey)} ({count})
              </button>
            );
          })}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <>
            <p className="text-sm text-stone-500 mb-5">
              {tr("showing")} <span className="font-bold text-ink">{filtered.length}</span> {tr("product")}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-stone-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-stone-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-lg font-semibold">{tr("noResults")}</p>
            <p className="text-sm mt-1">{tr("tryOther")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
