"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { categories } from "@/lib/products";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const getTotalItems = useCartStore((s) => s.getTotalItems);
  const wishlist = useCartStore((s) => s.wishlist);
  const { lang, setLang, tr } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const totalItems = getTotalItems();

  const catNames: Record<string, string> = {
    dates: tr("cat_dates"),
    "arabic-coffee": tr("cat_arabic_coffee"),
    tea: tr("cat_tea"),
    saffron: tr("cat_saffron"),
    hospitality: tr("cat_hospitality"),
    tools: tr("cat_tools"),
    "gift-boxes": tr("cat_gift_boxes"),
    deals: tr("cat_deals"),
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-sm shadow-md" : "bg-white shadow-sm"
      }`}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-18">

          {/* Left side (RTL: cart/search | LTR: logo) — flex reversal handled by dir */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg text-stone-600 hover:text-brown hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label={tr("searchPlaceholder")}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Wishlist */}
            <Link href="/shop" className="relative p-2 rounded-lg text-stone-600 hover:text-brown hover:bg-stone-100 transition-colors cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -left-0.5 bg-gold text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 rounded-lg text-stone-600 hover:text-brown hover:bg-stone-100 transition-colors cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -left-0.5 bg-brown text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Language toggle — FUNCTIONAL */}
            <div className="hidden sm:flex items-center border border-stone-200 rounded-lg overflow-hidden text-xs font-semibold">
              <button
                onClick={() => setLang("ar")}
                className={`px-2.5 py-1.5 transition-colors cursor-pointer ${
                  lang === "ar" ? "bg-brown text-white" : "text-stone-500 hover:bg-stone-50"
                }`}
              >
                AR
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-2.5 py-1.5 transition-colors cursor-pointer ${
                  lang === "en" ? "bg-brown text-white" : "text-stone-500 hover:bg-stone-50"
                }`}
              >
                EN
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="menu"
            >
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Center — desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {categories.slice(0, 5).map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="px-3 py-1.5 text-sm text-stone-600 hover:text-brown hover:bg-stone-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                {catNames[cat.slug] ?? cat.name}
              </Link>
            ))}
            <Link
              href="/shop"
              className="px-3 py-1.5 text-sm text-gold font-semibold hover:bg-gold/10 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              {tr("allProducts")}
            </Link>
          </nav>

          {/* Right side — logo */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <div className="flex flex-col items-end leading-none">
              <span className="text-2xl font-black text-brown tracking-wide">تموري</span>
              <span className="text-[10px] text-gold font-medium hidden sm:block">{tr("logoTagline")}</span>
            </div>
            <div className="w-9 h-9 bg-gradient-to-br from-brown to-gold rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm">
              ت
            </div>
          </Link>
        </div>

        {/* Search bar dropdown */}
        {searchOpen && (
          <div className="pb-3 animate-slide-up">
            <div className="relative">
              <input
                type="text"
                placeholder={tr("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-100 rounded-xl px-4 py-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-brown/30 transition-all"
                autoFocus
              />
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-stone-100 py-3 animate-slide-up">
            <div className="grid grid-cols-2 gap-1">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-stone-700 hover:text-brown hover:bg-stone-50 rounded-lg transition-colors cursor-pointer"
                >
                  {catNames[cat.slug] ?? cat.name}
                </Link>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
              <Link href="/contact" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-stone-600 hover:text-brown cursor-pointer">
                {tr("contactUs")}
              </Link>
              {/* Language toggle in mobile menu */}
              <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden text-xs font-semibold mx-3">
                <button onClick={() => setLang("ar")} className={`px-3 py-1.5 cursor-pointer transition-colors ${lang === "ar" ? "bg-brown text-white" : "text-stone-500"}`}>AR</button>
                <button onClick={() => setLang("en")} className={`px-3 py-1.5 cursor-pointer transition-colors ${lang === "en" ? "bg-brown text-white" : "text-stone-500"}`}>EN</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
