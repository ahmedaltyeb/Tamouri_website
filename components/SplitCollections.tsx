"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import SectionHeader from "@/components/SectionHeader";

// ── Types ────────────────────────────────────────────────────────────────────

interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  nameEn: string | null;
  nameAr: string | null;
  image: string | null;
  featured: boolean;
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

// ── Fallback images (same map used by CategoryCards) ─────────────────────────

const FALLBACK_IMAGES: Record<string, string> = {
  "dates":            "https://i.ibb.co/WvwTpK27/dates.jpg",
  "arabic-coffee":    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80",
  "specialty-coffee": "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80",
  "tea":              "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80",
  "tools":            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
  "gift-boxes":       "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80",
  "sweets":           "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80",
};

const FALLBACK_IMG = "https://i.ibb.co/WvwTpK27/dates.jpg";

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="card overflow-hidden animate-pulse flex-1">
      <div className="h-full min-h-[130px] bg-stone-100 rounded-2xl" />
    </div>
  );
}

// ── Collection card ───────────────────────────────────────────────────────────

function CollectionCard({ cat, displayName }: { cat: ApiCategory; displayName: string }) {
  const imgSrc = cat.image ?? FALLBACK_IMAGES[cat.slug] ?? FALLBACK_IMG;

  return (
    <Link
      href={`/shop?category=${cat.slug}`}
      className="group card overflow-hidden flex-1 min-h-[130px] relative block"
    >
      {/* Image */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={displayName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {/* Gradient overlay — same pattern used on gift-boxes/weekly-deals hero cards */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />

      {/* Text */}
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <span className="text-sm md:text-base font-bold text-white drop-shadow-sm leading-tight">
          {displayName}
        </span>
        <span className="flex items-center gap-1 text-gold text-xs font-semibold mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* arrow uses text direction — no hardcoded ltr/rtl */}
          <svg className="w-3.5 h-3.5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="sr-only">Shop {displayName}</span>
        </span>
      </div>
    </Link>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SplitCollections({ section }: Props) {
  const { lang, tr } = useLanguage();
  const [categories, setCategories] = useState<ApiCategory[] | null>(null);

  useEffect(() => {
    fetch("/api/categories?homepage=true")
      .then((r) => r.json())
      .then((data: { categories: ApiCategory[] }) => {
        // Pick top 3 (same sort order as CategoryCards)
        setCategories(data.categories.slice(0, 3));
      })
      .catch(() => setCategories([]));
  }, []);

  // CMS-driven text with translation fallbacks — same pattern as WhyTamouri
  const badge    = (lang === "ar" ? section?.badgeAr    : section?.badgeEn)    ?? tr("splitBadge");
  const title    = (lang === "ar" ? section?.titleAr    : section?.titleEn)    ?? tr("splitTitle");
  const subtitle = (lang === "ar" ? section?.subtitleAr : section?.subtitleEn) ?? tr("splitSub");

  return (
    <section className="py-14 bg-white border-y border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section header — same as every other section */}
        <SectionHeader badge={badge} title={title} subtitle={subtitle} className="mb-10" />

        {/* Split layout: text left + cards right on md+ */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-stretch">

          {/* ── LEFT: headline + CTAs ─────────────────────────────────────── */}
          <div className="flex flex-col justify-center md:w-[38%]">
            {/* Decorative rule — matches brown-dark accent used in WhyTamouri CTA */}
            <div className="w-10 h-1 rounded-full bg-gold mb-6" />

            <p className="text-stone-500 text-sm md:text-base leading-relaxed mb-8 max-w-sm">
              {subtitle}
            </p>

            {/* Buttons — exact existing CSS component classes */}
            <div className="flex flex-wrap gap-3">
              <Link href="/shop" className="btn-gold">
                {tr("splitShopNow")}
              </Link>
              <Link href="/gift-boxes" className="btn-outline">
                {tr("splitExplore")}
              </Link>
            </div>

            {/* Trust strip — matches WhyTamouri stats pattern */}
            <div className="flex items-center gap-6 mt-8 pt-6 border-t border-stone-100">
              <div className="text-center">
                <p className="text-xl font-bold text-ink">+500</p>
                <p className="text-stone-400 text-xs mt-0.5">{lang === "ar" ? "منتج" : "Products"}</p>
              </div>
              <div className="w-px h-8 bg-stone-100" />
              <div className="text-center">
                <p className="text-xl font-bold text-ink">+2000</p>
                <p className="text-stone-400 text-xs mt-0.5">{lang === "ar" ? "عميل راضٍ" : "Happy customers"}</p>
              </div>
              <div className="w-px h-8 bg-stone-100" />
              <div className="text-center">
                <p className="text-xl font-bold text-ink">24h</p>
                <p className="text-stone-400 text-xs mt-0.5">{lang === "ar" ? "توصيل" : "Delivery"}</p>
              </div>
            </div>
          </div>

          {/* ── RIGHT: 3 collection cards stacked ───────────────────────── */}
          <div className="flex flex-col gap-3 flex-1 min-h-[340px] md:min-h-[420px]">
            {categories === null ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : categories.length === 0 ? (
              // Empty state — same pattern as FeaturedProducts
              <div className="flex-1 flex items-center justify-center bg-stone-50 rounded-2xl border border-stone-100">
                <p className="text-stone-400 text-sm">{lang === "ar" ? "لا توجد فئات" : "No categories yet"}</p>
              </div>
            ) : (
              categories.map((cat) => {
                const displayName = lang === "ar"
                  ? (cat.nameAr ?? cat.nameEn ?? cat.name)
                  : (cat.nameEn ?? cat.name);
                return <CollectionCard key={cat.id} cat={cat} displayName={displayName} />;
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
