"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import SectionHeader from "@/components/SectionHeader";

interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  nameEn: string | null;
  nameAr: string | null;
  image: string | null;
}

// Fallback images for categories that haven't been given a DB image yet.
const FALLBACK_IMAGES: Record<string, string> = {
  "dates":            "https://i.ibb.co/WvwTpK27/dates.jpg",
  "arabic-coffee":    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&q=80",
  "specialty-coffee": "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=80",
  "tea":              "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&q=80",
  "tools":            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=80",
  "travel-tools":     "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=300&q=80",
  "sweets":           "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&q=80",
};

function SkeletonRow() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 md:flex-wrap md:justify-center md:overflow-visible">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex-none w-28 md:w-32 flex flex-col items-center gap-2 animate-pulse">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-stone-100" />
          <div className="h-3 w-16 bg-stone-100 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function CategoryCards() {
  const { lang, tr } = useLanguage();
  const [categories, setCategories] = useState<ApiCategory[] | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json())
      .then((data: ApiCategory[]) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  if (categories !== null && categories.length === 0) return null;

  return (
    <section className="py-10 bg-white border-y border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader title={tr("shopByCategory")} className="mb-4" />
        <div className="flex justify-center mb-6">
          <Link href="/shop" className="text-sm text-gold font-semibold hover:text-gold-dark transition-colors cursor-pointer">
            {tr("viewAll")}
          </Link>
        </div>

        {categories === null ? (
          <SkeletonRow />
        ) : (
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1 md:flex-wrap md:justify-center md:overflow-visible">
            {categories.map((cat) => {
              const imgSrc = cat.image ?? FALLBACK_IMAGES[cat.slug] ?? FALLBACK_IMAGES["dates"];
              const displayName = lang === "ar"
                ? (cat.nameAr ?? cat.nameEn ?? cat.name)
                : (cat.nameEn ?? cat.name);

              return (
                <Link key={cat.id} href={`/shop?category=${cat.slug}`} className="flex-none group cursor-pointer">
                  <div className="w-28 md:w-32 flex flex-col items-center gap-2">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-stone-100 group-hover:border-gold transition-colors duration-300 shadow-sm group-hover:shadow-md bg-stone-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgSrc}
                        alt={displayName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <span className="text-xs md:text-sm font-semibold text-center text-stone-700 group-hover:text-brown transition-colors leading-tight">
                      {displayName}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
