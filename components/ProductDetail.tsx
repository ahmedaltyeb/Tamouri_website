"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useCartStore } from "@/store/cartStore";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Product } from "@/lib/products";

export interface ProductDetailProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  category: string;
  categorySlug: string;
  image: string;
  badge: string | null;
  rating: number;
  reviews: number;
  inStock: boolean;
  stock: number;
}

interface Props {
  product: ProductDetailProduct;
  related: ProductDetailProduct[];
}

export default function ProductDetail({ product, related }: Props) {
  const addToCart = useCartStore((s) => s.addToCart);
  const toggleWishlist = useCartStore((s) => s.toggleWishlist);
  const wishlist = useCartStore((s) => s.wishlist);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { tr } = useLanguage();

  const isWishlisted = wishlist.includes(product.id);
  const outOfStock = !product.inStock || product.stock === 0;
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (outOfStock) return;
    for (let i = 0; i < qty; i++) addToCart(product as Product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm text-stone-400 mb-8">
        <Link href="/" className="hover:text-brown transition-colors">{tr("home")}</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-brown transition-colors">{tr("shop")}</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.categorySlug}`} className="hover:text-brown transition-colors">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-ink font-medium truncate">{product.name}</span>
      </nav>

      {/* Product detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        {/* Image */}
        <div className="relative">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {product.badge && (
              <span className="bg-brown text-white text-xs font-bold px-3 py-1 rounded-lg shadow">
                {product.badge}
              </span>
            )}
            {discount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-lg shadow">
                -{discount}%
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <span className="inline-flex w-fit items-center gap-1.5 bg-gold/10 text-gold text-xs font-bold px-3 py-1 rounded-full mb-3">
            {product.category}
          </span>

          <h1 className="text-2xl md:text-3xl font-black text-ink mb-3 leading-snug">
            {product.name}
          </h1>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-0.5" aria-label={`${product.rating} out of 5 stars`}>
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(product.rating) ? "text-gold" : "text-stone-200"} fill-current`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-stone-500 text-sm">
              {product.rating} ({product.reviews} {tr("reviews")})
            </span>
          </div>

          {/* Stock badge */}
          {outOfStock ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full mb-4">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              {tr("outOfStock")}
            </span>
          ) : product.stock > 0 && product.stock <= 5 ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full mb-4">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              {product.stock} {tr("itemsLeft")}
            </span>
          ) : null}

          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-3xl font-black text-brown">{product.price}</span>
            <span className="text-base font-semibold text-brown">{tr("aed")}</span>
            {product.originalPrice && (
              <span className="text-stone-400 text-lg line-through">
                {product.originalPrice} {tr("aed")}
              </span>
            )}
          </div>

          <p className="text-stone-600 text-sm leading-relaxed mb-6 border-t border-stone-100 pt-5">
            {product.description}
          </p>

          <div className="flex items-center gap-4 mb-5">
            <span className="text-sm font-semibold text-stone-700">{tr("quantity")}</span>
            <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
                aria-label="decrease quantity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="w-10 text-center font-bold text-sm">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
                aria-label="increase quantity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                added
                  ? "bg-green-500 text-white"
                  : outOfStock
                  ? "bg-stone-200 text-stone-400"
                  : "bg-brown hover:bg-brown-dark text-white"
              }`}
            >
              {added ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {tr("addedToCart")}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {tr("addToCartBtn")}
                </>
              )}
            </button>
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 transition-all active:scale-95 cursor-pointer ${
                isWishlisted
                  ? "border-red-400 bg-red-50 text-red-500"
                  : "border-stone-200 text-stone-400 hover:border-red-300 hover:text-red-400"
              }`}
              aria-label={isWishlisted ? "remove from wishlist" : "add to wishlist"}
            >
              <svg
                className="w-5 h-5"
                fill={isWishlisted ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              {
                text: tr("fastDelivery"),
                icon: (
                  <svg className="w-3.5 h-3.5 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                ),
              },
              {
                text: tr("returns"),
                icon: (
                  <svg className="w-3.5 h-3.5 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                ),
              },
              {
                text: tr("securePay"),
                icon: (
                  <svg className="w-3.5 h-3.5 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
              },
            ].map((badge) => (
              <div key={badge.text} className="flex items-center gap-1.5 text-xs text-stone-500 bg-stone-50 px-3 py-1.5 rounded-lg">
                {badge.icon}
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-ink mb-6">{tr("relatedProducts")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p as Product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
