"use client";
import Link from "next/link";
import { categories } from "@/lib/products";
import { useLanguage } from "@/contexts/LanguageContext";

const categoryImages: Record<string, string> = {
  "dates":            "https://images.unsplash.com/photo-1559628233-100c798642d6?w=300&q=80",
  "arabic-coffee":    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&q=80",
  "specialty-coffee": "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=80",
  "tea":              "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&q=80",
  "tools":            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=80",
  "travel-tools":     "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=300&q=80",
  "sweets":           "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&q=80",
};

export default function CategoryCards() {
  const { tr } = useLanguage();

  return (
    <section className="py-10 bg-white border-y border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title text-xl md:text-2xl">{tr("shopByCategory")}</h2>
          <Link href="/shop" className="text-sm text-gold font-semibold hover:text-gold-dark transition-colors cursor-pointer">
            {tr("viewAll")}
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/shop?category=${cat.slug}`} className="flex-none group cursor-pointer">
              <div className="w-28 md:w-32 flex flex-col items-center gap-2">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-stone-100 group-hover:border-gold transition-colors duration-300 shadow-sm group-hover:shadow-md bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={categoryImages[cat.slug] ?? categoryImages["dates"]}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <span className="text-xs md:text-sm font-semibold text-center text-stone-700 group-hover:text-brown transition-colors leading-tight">
                  {tr(cat.nameKey)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
