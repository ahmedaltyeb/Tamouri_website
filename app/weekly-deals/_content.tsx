"use client";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import ProductCard from "@/components/ProductCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProducts } from "@/hooks/useProducts";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

// ── Static bilingual content ──────────────────────────────────────────────────

const STEPS = [
  {
    num: "01",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    en: { title: "New Deals Every Sunday", desc: "Fresh handpicked offers drop every Sunday morning — be the first to grab the best products." },
    ar: { title: "عروض جديدة كل أحد", desc: "عروض مختارة بعناية تُنشر كل صباح أحد — كن أول من يحصل على أفضل المنتجات." },
  },
  {
    num: "02",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    en: { title: "Discounts Up to 30%", desc: "Save significantly on premium products — from single items to gift sets and bulk orders." },
    ar: { title: "خصومات تصل إلى ٣٠٪", desc: "وفّر بشكل ملحوظ على المنتجات الفاخرة — من المنتجات الفردية إلى صناديق الهدايا والطلبات بالجملة." },
  },
  {
    num: "03",
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    en: { title: "Limited Stock Only", desc: "Deal quantities are limited each week. Once they're gone, they're gone — act fast!" },
    ar: { title: "كميات محدودة فقط", desc: "كميات العروض محدودة كل أسبوع. بمجرد نفادها، تنتهي — تصرف بسرعة!" },
  },
  {
    num: "04",
    icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
    en: { title: "Auto Discount at Checkout", desc: "No coupon codes needed — deal prices apply automatically when you add to cart." },
    ar: { title: "خصم تلقائي عند الدفع", desc: "لا حاجة لأكواد الخصم — تُطبَّق أسعار العروض تلقائياً عند إضافتها إلى السلة." },
  },
];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-stone-100" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-stone-100 rounded w-2/3" />
        <div className="h-4 bg-stone-100 rounded w-full" />
        <div className="h-4 bg-stone-100 rounded w-1/2" />
      </div>
    </div>
  );
}

interface Props {
  heroImage?: string | null;
  heroImageAltEn?: string | null;
  heroImageAltAr?: string | null;
}

export default function WeeklyDealsContent({ heroImage, heroImageAltEn, heroImageAltAr }: Props) {
  const { lang } = useLanguage();
  const { products, loading } = useProducts();
  const { settings } = useSiteSettings();
  const dir = lang === "ar" ? "rtl" : "ltr";

  // Products with a discount (originalPrice > price), sorted highest discount first
  const dealProducts = products
    .filter((p) => p.originalPrice != null && p.originalPrice > p.price)
    .sort((a, b) => {
      const discA = ((a.originalPrice! - a.price) / a.originalPrice!) * 100;
      const discB = ((b.originalPrice! - b.price) / b.originalPrice!) * 100;
      return discB - discA;
    });

  const whatsappHref = settings.whatsappUrl ?? "https://wa.me/971000000000";

  return (
    <main className="min-h-screen">
      <TopBar />
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" dir={dir}
        style={{ background: "linear-gradient(135deg, #78350f 0%, #92400e 40%, #b45309 100%)" }}>
        {/* Decorative elements */}
        <div className="pointer-events-none absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #fbbf24 0%, transparent 60%)" }} />
        <div className="pointer-events-none absolute top-0 end-0 w-72 h-72 rounded-full border border-white/10 translate-x-1/3 -translate-y-1/3" />
        <div className="pointer-events-none absolute bottom-0 start-0 w-48 h-48 rounded-full border border-white/10 -translate-x-1/3 translate-y-1/3" />

        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 ${heroImage ? "flex flex-col md:flex-row items-center gap-10 md:gap-16" : ""}`}>
          <div className={heroImage ? "flex-1 min-w-0" : "max-w-2xl"}>
            {/* Urgency badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/30 text-white text-xs font-bold mb-6 uppercase tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" />
              </span>
              {lang === "ar" ? "عروض هذا الأسبوع" : "This Week's Deals"}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4">
              {lang === "ar" ? (
                <>أفضل عروض<br /><span className="text-amber-300">هذا الأسبوع</span></>
              ) : (
                <>This Week's<br /><span className="text-amber-300">Best Deals</span></>
              )}
            </h1>

            <p className="text-white/70 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
              {lang === "ar"
                ? "لا تفوّت عروضنا الأسبوعية على التمور الفاخرة والقهوة العربية والزعفران وصناديق الهدايا. عروض جديدة كل أحد — وفّر بشكل كبير!"
                : "Don't miss our handpicked weekly offers on premium dates, Arabic coffee, saffron, and gift sets. New deals every Sunday — save big on your favourites!"}
            </p>

            {/* Discount highlight */}
            <div className="inline-flex items-center gap-4 bg-white/10 border border-white/20 rounded-2xl px-5 py-3 mb-6">
              <div className="text-center">
                <div className="text-3xl font-black text-amber-300">30%</div>
                <div className="text-white/60 text-xs">{lang === "ar" ? "أقصى خصم" : "Max Discount"}</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-black text-white">{dealProducts.length || "—"}</div>
                <div className="text-white/60 text-xs">{lang === "ar" ? "منتج بعرض" : "Products On Sale"}</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-black text-white">∞</div>
                <div className="text-white/60 text-xs">{lang === "ar" ? "توصيل سريع" : "Fast Delivery"}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a href="#deals" className="btn-gold">
                {lang === "ar" ? "رؤية العروض الآن" : "See Deals Now"}
              </a>
              <Link href="/shop" className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:border-amber-300 hover:text-amber-300 transition-all duration-200 active:scale-95 cursor-pointer">
                {lang === "ar" ? "تصفح المتجر" : "Browse Shop"}
              </Link>
            </div>
          </div>

          {/* Hero image column — only rendered when a hero image is set */}
          {heroImage && (
            <div className="flex-shrink-0 w-full md:w-[45%] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroImage}
                alt={lang === "ar" ? (heroImageAltAr ?? "") : (heroImageAltEn ?? "")}
                className="w-full max-h-80 md:max-h-96 object-contain rounded-2xl"
              />
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white" dir={dir}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            badge={lang === "ar" ? "كيف يعمل" : "How It Works"}
            title={lang === "ar" ? "أربع خطوات بسيطة" : "Four Simple Steps"}
            subtitle={lang === "ar" ? "توفير أكبر، بأقل جهد ممكن" : "Maximum savings with minimal effort"}
            className="mb-12"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => {
              const t = lang === "ar" ? step.ar : step.en;
              return (
                <div key={i} className="relative group">
                  {/* Connector line (hidden on last item and mobile) */}
                  {i < STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-6 start-full w-full h-px bg-stone-200 z-0" style={{ width: "calc(100% - 3rem)", left: lang === "ar" ? "auto" : "3rem", right: lang === "ar" ? "3rem" : "auto" }} />
                  )}

                  <div className="relative z-10 bg-white rounded-2xl border border-stone-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-none group-hover:bg-amber-100 transition-colors duration-300">
                        <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                        </svg>
                      </div>
                      <span className="text-3xl font-black text-stone-100 group-hover:text-amber-100 transition-colors duration-300 leading-none mt-1">
                        {step.num}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-ink mb-2">{t.title}</h3>
                    <p className="text-stone-500 text-sm leading-relaxed">{t.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── DEALS GRID ───────────────────────────────────────────────────────── */}
      <section id="deals" className="py-16 bg-cream" dir={dir}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            badge={lang === "ar" ? "عروض الأسبوع" : "This Week's Offers"}
            title={lang === "ar" ? "المنتجات بعروض خاصة" : "Products On Special Offer"}
            subtitle={lang === "ar" ? "مرتبة من الأعلى خصماً إلى الأقل — الكميات محدودة" : "Sorted by highest discount first — limited quantities available"}
            className="mb-10"
          />

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : dealProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {dealProducts.map((p, i) => (
                  <ProductCard key={p.id} product={p} priority={i < 4} />
                ))}
              </div>
              <div className="mt-10 text-center">
                <Link href="/shop" className="btn-outline inline-block">
                  {lang === "ar" ? "تصفح جميع المنتجات" : "Browse All Products"}
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-100">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-semibold text-stone-700 mb-1">
                {lang === "ar" ? "عروض هذا الأسبوع قريباً" : "This week's deals coming soon"}
              </p>
              <p className="text-stone-400 text-sm mb-4">
                {lang === "ar" ? "ترقب عروضنا كل يوم أحد" : "Check back every Sunday for new deals"}
              </p>
              <Link href="/shop" className="btn-primary inline-block">
                {lang === "ar" ? "تصفح المتجر" : "Browse Shop"}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── URGENCY CTA ──────────────────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-br from-stone-900 to-brown-dark" dir={dir}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-400/30 text-red-300 text-xs font-bold mb-6 uppercase tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" />
            </span>
            {lang === "ar" ? "تنبيه عرض محدود" : "Limited Offer Alert"}
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
            {lang === "ar"
              ? "العروض الأسبوعية تتغير بسرعة — لا تفوّتها!"
              : "Weekly Deals Change Fast — Don't Miss Out!"}
          </h2>
          <p className="text-white/60 text-base leading-relaxed mb-8 max-w-xl mx-auto">
            {lang === "ar"
              ? "اشترك في قناتنا على واتساب لتصلك إشعارات فورية بمجرد نشر عروض جديدة كل أحد."
              : "Subscribe to our WhatsApp channel to be notified the moment new deals go live every Sunday."}
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer"
              className="btn-gold inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {lang === "ar" ? "اشترك على واتساب" : "Subscribe on WhatsApp"}
            </a>
            <Link href="/shop?category=deals"
              className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:border-amber-300 hover:text-amber-300 transition-all duration-200 active:scale-95 cursor-pointer">
              {lang === "ar" ? "تصفح جميع العروض" : "Browse All Deals"}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
