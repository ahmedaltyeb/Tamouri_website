"use client";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/products";
import { parseMLText } from "@/lib/products";
import { useCartStore } from "@/store/cartStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

const PLACEHOLDER = "/placeholder.svg";

// Products from the DB may carry an images[] field not in the static type
interface DBProduct extends Product {
  images?: string[];
}
interface Props {
  product: DBProduct;
  priority?: boolean; // pass true for above-the-fold cards to improve LCP
}

export default function ProductCard({ product, priority = false }: Props) {
  const addToCart = useCartStore((s) => s.addToCart);
  const toggleWishlist = useCartStore((s) => s.toggleWishlist);
  const wishlist = useCartStore((s) => s.wishlist);
  const [added, setAdded] = useState(false);
  const { tr, lang } = useLanguage();

  const name = parseMLText(product.name)[lang];

  // BUG FIX #1: use || (not ??) so empty strings fall through to PLACEHOLDER
  const rawImage = product.images?.[0] || product.image || PLACEHOLDER;

  // BUG FIX #2: state-backed src so onError can swap to PLACEHOLDER
  const [imgSrc, setImgSrc] = useState(rawImage);

  const isWishlisted = wishlist.includes(product.id);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

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

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer flex flex-col">

        {/* ── Image area ── */}
        <div className="relative bg-white aspect-square overflow-hidden">
          <Image
            src={imgSrc}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
            priority={priority}
            // BUG FIX #2: fall back to placeholder on load error
            onError={() => setImgSrc(PLACEHOLDER)}
          />

          {/* Badges */}
          <div className="absolute top-2 end-2 flex flex-col gap-1">
            {product.badge && (
              <span className="bg-brown text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                {product.badge}
              </span>
            )}
            {discount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                -{discount}%
              </span>
            )}
          </div>

          {/* Out of stock overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-xs font-bold text-stone-400 bg-white border border-stone-200 px-3 py-1 rounded-full">
                {tr("outOfStock")}
              </span>
            </div>
          )}

          {/* Wishlist button — visible on hover */}
          <button
            onClick={handleWishlist}
            className="absolute top-2 start-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 cursor-pointer"
            aria-label="wishlist"
          >
            <svg
              className={`w-4 h-4 transition-colors ${isWishlisted ? "text-red-500 fill-current" : "text-stone-400"}`}
              fill={isWishlisted ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>
        </div>

        {/* Thin divider */}
        <div className="h-px bg-stone-100 mx-3" />

        {/* ── Info area ── */}
        <div className="p-3 flex flex-col gap-2 flex-1">
          {/* Category label */}
          <span className="text-[10px] text-gold font-bold uppercase tracking-wide leading-none">
            {product.category}
          </span>

          {/* Product name */}
          <h3 className="font-bold text-sm text-ink leading-snug line-clamp-2 group-hover:text-brown transition-colors min-h-[2.5rem]">
            {name}
          </h3>

          {/* Star rating */}
          <div className="flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? "text-gold" : "text-stone-200"}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <span className="text-[10px] text-stone-400">({product.reviews})</span>
          </div>

          {/* Price row */}
          <div className="flex items-baseline gap-1.5 mt-auto">
            <span className="font-black text-brown text-lg leading-none">
              {product.price}
            </span>
            <span className="text-xs font-semibold text-brown">{tr("aed")}</span>
            {product.originalPrice && (
              <span className="text-stone-400 text-xs line-through ms-1">
                {product.originalPrice}
              </span>
            )}
          </div>

          {/* Add to cart — full width */}
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              added
                ? "bg-green-500 text-white"
                : !product.inStock
                ? "bg-stone-100 text-stone-400"
                : "bg-brown hover:bg-brown-dark text-white"
            }`}
          >
            {added ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                </svg>
                {tr("added")}
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <span className="hidden sm:inline">{tr("addToCart")}</span>
                <span className="sm:hidden">{tr("add")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
