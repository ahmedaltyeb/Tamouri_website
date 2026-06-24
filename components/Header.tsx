"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { categories } from "@/lib/products";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

/** Strip Arabic unicode from a field that should contain Latin text. */
function latinOnly(text: string): string {
  return text.replace(/[؀-ۿݐ-ݿࢠ-ࣿ]+/g, "").replace(/\s+/g, " ").trim();
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const getTotalItems = useCartStore((s) => s.getTotalItems);
  const wishlist = useCartStore((s) => s.wishlist);
  const { lang, dir, setLang, tr } = useLanguage();
  const { user } = useCustomerAuth();
  const { settings } = useSiteSettings();
  const router = useRouter();
  const pathname = usePathname();
  const catRef = useRef<HTMLDivElement>(null);
  const totalItems = getTotalItems();

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

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm" dir={dir}>

      {/* ── Row 1: utility bar ── */}
      <div className="border-b border-stone-100 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-9 text-xs text-stone-500 gap-1">

          {/* Tagline — hidden on mobile */}
          <span className="hidden lg:block text-stone-400 me-3">{tr("logoTagline")}</span>

          {/* ── Home + Store quick-nav icons ── */}
          <Link
            href="/"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-medium ${
              isActive("/") && pathname === "/"
                ? "text-brown bg-brown/5"
                : "hover:text-brown hover:bg-stone-100"
            }`}
          >
            {/* House icon */}
            <svg className="w-3.5 h-3.5 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 22V12h6v10"/>
            </svg>
            <span className="hidden sm:inline">{tr("home")}</span>
          </Link>

          <span className="text-stone-200">|</span>

          <Link
            href="/shop"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-medium ${
              isActive("/shop")
                ? "text-brown bg-brown/5"
                : "hover:text-brown hover:bg-stone-100"
            }`}
          >
            {/* Store / shop icon */}
            <svg className="w-3.5 h-3.5 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <span className="hidden sm:inline">{tr("shop")}</span>
          </Link>

          <span className="text-stone-200">|</span>

          <Link href="/track-order" className="px-2.5 py-1 rounded-lg hover:text-brown hover:bg-stone-100 transition-colors cursor-pointer">
            {tr("trackOrder")}
          </Link>

          <span className="text-stone-200">|</span>

          <Link href="/contact" className="px-2.5 py-1 rounded-lg hover:text-brown hover:bg-stone-100 transition-colors cursor-pointer">
            {tr("contactUs")}
          </Link>

          {/* AR / EN toggle — pushed to end */}
          <div className="flex items-center divide-x divide-stone-200 border border-stone-200 rounded overflow-hidden font-semibold ms-auto">
            <button
              onClick={() => setLang("ar")}
              aria-label="العربية"
              className={`px-2.5 py-0.5 transition-colors cursor-pointer text-[11px] ${lang === "ar" ? "bg-brown text-white" : "hover:bg-stone-100"}`}
            >
              AR
            </button>
            <button
              onClick={() => setLang("en")}
              aria-label="English"
              className={`px-2.5 py-0.5 transition-colors cursor-pointer text-[11px] ${lang === "en" ? "bg-brown text-white" : "hover:bg-stone-100"}`}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {/* ── Row 2: main header ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer flex-none">
            {settings.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.logo}
                alt={settings.nameEn}
                className="w-11 h-11 rounded-xl object-contain p-0.5 bg-white shadow-sm border border-stone-100 flex-none"
              />
            ) : (
              <div className="w-11 h-11 bg-gradient-to-br from-brown to-gold rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm flex-none">
                {lang === "ar"
                  ? (settings.nameAr?.charAt(0) || "م")
                  : (settings.nameEn?.match(/[A-Za-z]+/)?.[0]?.substring(0, 2).toUpperCase() || "MG")}
              </div>
            )}
            <div className="flex-col leading-tight hidden sm:flex">
              <span className="text-sm font-black text-brown leading-none">
                {lang === "ar" ? settings.nameAr : latinOnly(settings.nameEn)}
              </span>
              <span className="text-[9px] text-gold font-bold tracking-wide">
                {lang === "ar" ? settings.taglineAr : latinOnly(settings.taglineEn)}
              </span>
            </div>
          </Link>

          {/* All Categories dropdown */}
          <div className="hidden md:block relative flex-none" ref={catRef}>
            <button
              onClick={() => setCatOpen(!catOpen)}
              className="flex items-center gap-2 bg-brown hover:bg-brown-dark text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
              {tr("allProducts")}
              <svg className={`w-3 h-3 transition-transform ${catOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            {catOpen && (
              <div className="absolute top-full mt-2 start-0 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 min-w-[210px] z-50 animate-slide-up">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.slug}`}
                    onClick={() => setCatOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:text-brown hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    {tr(cat.nameKey)}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 relative hidden sm:block">
            <input
              type="text"
              placeholder={tr("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 pe-10 text-sm outline-none focus:ring-2 focus:ring-brown/20 focus:border-brown/30 transition-all"
            />
            <button type="submit" className="absolute end-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-brown transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>
          </form>

          {/* Icons: wishlist + account + cart + mobile menu */}
          <div className="flex items-center gap-1 ms-auto sm:ms-0">
            <Link href="/account/wishlist" className="relative p-2 rounded-lg text-stone-600 hover:text-brown hover:bg-stone-100 transition-colors cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -end-0.5 bg-gold text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link
              href={user ? "/account/profile" : "/account/login"}
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl transition-colors cursor-pointer ${isActive("/account") ? "text-brown bg-brown/5" : "text-stone-600 hover:text-brown hover:bg-stone-100"}`}
              aria-label={tr("myAccount")}
            >
              {user ? (
                <div className="w-6 h-6 bg-brown text-white rounded-full flex items-center justify-center text-xs font-black flex-none">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <svg className="w-5 h-5 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              )}
              <span className="hidden md:inline text-xs font-medium">
                {user ? user.name.split(" ")[0] : tr("signIn")}
              </span>
            </Link>

            <Link href="/cart" className="relative flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-2 rounded-xl transition-colors cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              <span className="text-sm font-bold min-w-[12px] text-center">{totalItems}</span>
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label={lang === "ar" ? "القائمة" : "Menu"}
            >
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden pb-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder={tr("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 pe-10 text-sm outline-none focus:ring-2 focus:ring-brown/20"
            />
            <button type="submit" className="absolute end-3 top-1/2 -translate-y-1/2 text-stone-400 cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>
          </form>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-stone-100 py-3 animate-slide-up">
            {/* Home + Store as first items */}
            <div className="flex gap-2 mb-2 pb-2 border-b border-stone-100">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-stone-700 hover:text-brown hover:bg-stone-50 rounded-lg transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 22V12h6v10"/>
                </svg>
                {tr("home")}
              </Link>
              <Link
                href="/shop"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-stone-700 hover:text-brown hover:bg-stone-50 rounded-lg transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                {tr("shop")}
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-1">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-stone-700 hover:text-brown hover:bg-stone-50 rounded-lg transition-colors cursor-pointer"
                >
                  {tr(cat.nameKey)}
                </Link>
              ))}
            </div>

            <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
              <div className="flex gap-1">
                <Link href="/track-order" onClick={() => setMenuOpen(false)} className="px-3 py-2 text-sm text-stone-600 hover:text-brown cursor-pointer">
                  {tr("trackOrder")}
                </Link>
                <Link href="/contact" onClick={() => setMenuOpen(false)} className="px-3 py-2 text-sm text-stone-600 hover:text-brown cursor-pointer">
                  {tr("contactUs")}
                </Link>
              </div>
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
