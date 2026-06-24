"use client";
import Link from "next/link";
import ProductCard from "./ProductCard";
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

export default function FeaturedProducts() {
  const { tr, lang } = useLanguage();
  const { products, loading } = useProducts();
  const featured = products.slice(0, 8);

  return (
    <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-gold font-semibold text-sm mb-1">{tr("featuredBadge")}</p>
          <h2 className="section-title">{tr("featuredTitle")}</h2>
          <p className="section-subtitle mt-1">{tr("featuredSub")}</p>
        </div>
        <Link href="/shop" className="hidden md:flex items-center gap-1.5 text-brown font-semibold text-sm hover:text-brown-dark transition-colors cursor-pointer group">
          <span>{tr("viewAll")}</span>
          <svg className={`w-4 h-4 transition-transform ${lang === "ar" ? "group-hover:translate-x-1" : "rotate-180 group-hover:-translate-x-1"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : featured.map((product, i) => <ProductCard key={product.id} product={product} priority={i < 4} />)
        }
      </div>

      <div className="mt-8 text-center md:hidden">
        <Link href="/shop" className="btn-outline inline-block">{tr("viewAllProducts")}</Link>
      </div>
    </section>
  );
}
