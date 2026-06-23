"use client";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/products";

const PLACEHOLDER = "/placeholder.svg";
import { useCartStore } from "@/store/cartStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

// Product from DB may have an `images` array not present in the static Product type
interface DBProduct extends Product {
  images?: string[];
}
interface Props { product: DBProduct }

export default function ProductCard({ product }: Props) {
  // Use first element of images[] if available, otherwise legacy image field, otherwise placeholder
  const primaryImage = product.images?.[0] ?? product.image ?? PLACEHOLDER;
  const addToCart = useCartStore((s) => s.addToCart);
  const toggleWishlist = useCartStore((s) => s.toggleWishlist);
  const wishlist = useCartStore((s) => s.wishlist);
  const [added, setAdded] = useState(false);
  const { tr } = useLanguage();

  const isWishlisted = wishlist.includes(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product.id);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="card overflow-hidden cursor-pointer">
        <div className="relative overflow-hidden bg-stone-50 aspect-square">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {product.badge && (
              <span className="bg-brown text-white text-[10px] font-bold px-2 py-0.5 rounded-md">{product.badge}</span>
            )}
            {discount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">-{discount}%</span>
            )}
          </div>
          <button
            onClick={handleWishlist}
            className="absolute top-2 left-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 cursor-pointer"
            aria-label="wishlist"
          >
            <svg
              className={`w-4 h-4 transition-colors ${isWishlisted ? "text-red-500 fill-current" : "text-stone-400"}`}
              fill={isWishlisted ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        <div className="p-3 md:p-4">
          <span className="text-[10px] text-gold font-semibold uppercase tracking-wide">{product.category}</span>
          <h3 className="font-bold text-sm md:text-base text-ink mt-0.5 mb-1 leading-snug line-clamp-1 group-hover:text-brown transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? "text-gold" : "text-stone-200"}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-[10px] text-stone-400">({product.reviews})</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="font-black text-brown text-base md:text-lg">
                {product.price} <span className="text-xs font-semibold">{tr("aed")}</span>
              </span>
              {product.originalPrice && (
                <span className="text-stone-400 text-xs line-through">{product.originalPrice} {tr("aed")}</span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer ${
                added ? "bg-green-500 text-white" : "bg-brown text-white hover:bg-brown-dark"
              }`}
            >
              {added ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{tr("added")}</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">{tr("addToCart")}</span>
                  <span className="sm:hidden">{tr("add")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
