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

interface HomepageSectionData {
  badgeEn?: string | null;
  badgeAr?: string | null;
  titleEn?: string | null;
  titleAr?: string | null;
  subtitleEn?: string | null;
  subtitleAr?: string | null;
}

interface Props {
  section?: HomepageSectionData | null;
}

export default function FeaturedProducts({ section }: Props) {
  const { lang, tr } = useLanguage();
  const { products, loading } = useProducts();
  const featured = products.slice(0, 8);

  const badge    = (lang === "ar" ? section?.badgeAr    : section?.badgeEn)    ?? tr("featuredBadge");
  const title    = (lang === "ar" ? section?.titleAr    : section?.titleEn)    ?? tr("featuredTitle");
  const subtitle = (lang === "ar" ? section?.subtitleAr : section?.subtitleEn) ?? tr("featuredSub");

  return (
    <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6">
      <SectionHeader
        badge={badge}
        title={title}
        subtitle={subtitle}
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
