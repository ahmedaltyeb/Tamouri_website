"use client";
import { useEffect, useState, useCallback } from "react";
import AccountSidebar from "@/components/account/AccountSidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import Link from "next/link";

interface WishlistProduct {
  wishlistId: string; id: string; name: string; price: number;
  originalPrice?: number | null; image?: string | null; images: string[];
  category?: string | null; categorySlug?: string | null;
  inStock?: boolean; stock?: number;
}

export default function WishlistPage() {
  const { tr, dir } = useLanguage();
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/account/wishlist", { credentials: "include" })
      .then((r) => r.json()).then(setItems).catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function removeItem(wishlistId: string) {
    await fetch(`/api/account/wishlist/${wishlistId}`, { method: "DELETE", credentials: "include" });
    setItems((prev) => prev.filter((i) => i.wishlistId !== wishlistId));
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8" dir={dir}>
      <div className="flex flex-col md:flex-row gap-6">
        <AccountSidebar />

        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-ink mb-5">{tr("myWishlist")}</h2>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map((i) => <div key={i} className="aspect-square bg-stone-100 rounded-xl animate-pulse"/>)}
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-stone-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                <p className="text-stone-500 text-sm mb-3">{tr("noWishlistItems")}</p>
                <Link href="/shop" className="inline-block text-brown text-sm font-semibold hover:underline cursor-pointer">
                  {tr("continueShopping")}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {items.map((item) => {
                  const img = item.images?.[0] || item.image || "/placeholder.svg";
                  const inStock = item.inStock !== false && (item.stock ?? 1) > 0;
                  return (
                    <div key={item.wishlistId} className="group relative border border-stone-100 rounded-xl overflow-hidden hover:border-brown/30 hover:shadow-sm transition-all">
                      {/* Remove button */}
                      <button
                        onClick={() => removeItem(item.wishlistId)}
                        className="absolute top-2 end-2 z-10 w-7 h-7 bg-white rounded-full border border-stone-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:border-red-300 hover:text-red-500"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>

                      <Link href={`/product/${item.id}`} className="block cursor-pointer">
                        <div className="relative aspect-square bg-stone-50">
                          <Image
                            src={img} alt={item.name} fill
                            className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, 33vw"
                            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                          />
                          {!inStock && (
                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                              <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded-full">{tr("outOfStock")}</span>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-xs text-stone-500 mb-0.5">{item.category}</p>
                          <p className="text-sm font-semibold text-ink line-clamp-2 leading-tight">{item.name}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-sm font-bold text-brown">AED {item.price.toFixed(2)}</span>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <span className="text-xs text-stone-400 line-through">AED {item.originalPrice.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
