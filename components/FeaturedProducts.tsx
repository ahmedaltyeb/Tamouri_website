"use client";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProducts } from "@/hooks/useProducts";
import SectionHeader from "@/components/SectionHeader";

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
  const { tr } = useLanguage();
  const { products, loading } = useProducts();
  const featured = products.slice(0, 8);

  return (
    <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6">
      <SectionHeader
        badge={tr("featuredBadge")}
        title={tr("featuredTitle")}
        subtitle={tr("featuredSub")}
        className="mb-8"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : featured.map((product, i) => <ProductCard key={product.id} product={product} priority={i < 4} />)
        }
      </div>

      <div className="mt-8 text-center">
        <Link href="/shop" className="btn-outline inline-block">{tr("viewAllProducts")}</Link>
      </div>
    </section>
  );
}
