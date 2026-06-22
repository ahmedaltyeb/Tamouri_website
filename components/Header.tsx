"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { categories } from "@/lib/products";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const getTotalItems = useCartStore((s) => s.getTotalItems);
  const wishlist = useCartStore((s) => s.wishlist);
  const { lang, setLang, tr } = useLanguage();
  const router = useRouter();
  const catRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm" dir={lang === "ar" ? "rtl" : "ltr"}>

      {/* ── Row 1: utility bar ── */}
      <div className="border-b border-stone-100 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-9 text-xs text-stone-500">
          {/* Right side: logo tagline */}
          <span className="hidden sm:block">{tr("logoTagline")}</span>

          {/* Left side: links + language */}
          <div className="flex items-center gap-4 mr-auto sm:mr-0">
            <Link href="/contact" className="hover:text-brown transition-colors cursor-pointer">
              {tr("contactUs")}
            </Link>
            <span className="text-stone-300">|</span>
            <Link href="/shop?category=deals" className="text-gold font-semibold hover:text-gold-dark transition-colors cursor-pointer">
              {tr("cat_deals")}
            </Link>
            <span className="text-stone-300">|</span>
            {/* Language toggle */}
            <div className="flex items-center divide-x divide-stone-200 border border-stone-200 rounded overflow-hidden font-semibold">
              <button
                onClick={() => setLang("ar")}
                className={`px-2 py-0.5 transition-colors cursor-pointer ${lang === "ar" ? "bg-brown text-white" : "hover:bg-stone-100"}`}
              >
                AR
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-2 py-0.5 transition-colors cursor-pointer ${lang === "en" ? "bg-brown text-white" : "hover:bg-stone-100"}`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: main header ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 h-16">

          {/* Logo — RIGHT in RTL */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer flex-none">
            <div className="w-10 h-10 bg-gradient-to-br from-brown to-gold rounded-xl flex items-center justify-center text-white font-black text-xl shadow-sm">
              ت
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black text-brown tracking-wide">تموري</span>
              <span className="text-[9px] text-gold font-medium hidden sm:block">Tamouri</span>
            </div>
          </Link>

          {/* All Categories button + dropdown */}
          <div className="hidden md:block relative flex-none" ref={catRef}>
            <button
              onClick={() => setCatOpen(!catOpen)}
              className="flex items-center gap-2 bg-brown hover:bg-brown-dark text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {tr("allProducts")}
              <svg className={`w-3 h-3 transition-transform ${catOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {catOpen && (
              <div className="absolute top-full mt-2 start-0 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 min-w-[200px] z-50 animate-slide-up">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.slug}`}
                    onClick={() => setCatOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:text-brown hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    {catNames[cat.slug] ?? cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Search bar — takes remaining space */}
          <form onSubmit={handleSearch} className="flex-1 relative hidden sm:block">
            <input
              type="text"
              placeholder={tr("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-brown/20 focus:border-brown/30 transition-all"
            />
            <button type="submit" className="absolute start-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-brown transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* RIGHT icons: wishlist + cart */}
          <div className="flex items-center gap-1 mr-auto sm:mr-0">
            {/* Wishlist */}
            <Link href="/shop" className="relative p-2 rounded-lg text-stone-600 hover:text-brown hover:bg-stone-100 transition-colors cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gold text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-2 rounded-xl transition-colors cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-sm font-bold min-w-[12px] text-center">{totalItems}</span>
            </Link>

            {/* Mobile: menu button */}
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
        </div>

        {/* Mobile: search bar */}
        <div className="sm:hidden pb-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder={tr("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-brown/20"
            />
            <button type="submit" className="absolute start-3 top-1/2 -translate-y-1/2 text-stone-400 cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

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
              <div className="flex items-center divide-x divide-stone-200 border border-stone-200 rounded overflow-hidden text-xs font-semibold mx-3">
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
