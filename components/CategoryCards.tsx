import Link from "next/link";
import { categories } from "@/lib/products";

const categoryImages: Record<string, string> = {
  dates: "https://images.unsplash.com/photo-1559628233-100c798642d6?w=300&q=80",
  "arabic-coffee": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&q=80",
  tea: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&q=80",
  saffron: "https://images.unsplash.com/photo-1615485500834-bc10199bc727?w=300&q=80",
  hospitality: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&q=80",
  tools: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=80",
  "gift-boxes": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&q=80",
  deals: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=300&q=80",
};

export default function CategoryCards() {
  return (
    <section className="py-10 bg-white border-y border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title text-xl md:text-2xl">تسوق حسب الفئة</h2>
          <Link
            href="/shop"
            className="text-sm text-gold font-semibold hover:text-gold-dark transition-colors cursor-pointer"
          >
            عرض الكل
          </Link>
        </div>

        {/* Scrollable row */}
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="flex-none group cursor-pointer"
            >
              <div className="w-28 md:w-32 flex flex-col items-center gap-2">
                {/* Circle image */}
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-stone-100 group-hover:border-gold transition-colors duration-300 shadow-sm group-hover:shadow-md bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={categoryImages[cat.slug]}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <span className="text-xs md:text-sm font-semibold text-center text-stone-700 group-hover:text-brown transition-colors leading-tight">
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
