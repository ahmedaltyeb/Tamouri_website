"use client";
import Link from "next/link";
import { getFeaturedProducts } from "@/lib/products";
import ProductCard from "./ProductCard";
import { useLanguage } from "@/contexts/LanguageContext";

export default function FeaturedProducts() {
  const products = getFeaturedProducts();
  const { tr } = useLanguage();

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
          <svg className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-8 text-center md:hidden">
        <Link href="/shop" className="btn-outline inline-block">{tr("viewAllProducts")}</Link>
      </div>
    </section>
  );
}
