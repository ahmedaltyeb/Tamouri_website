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

const FEATURES = [
  {
    icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
    en: { title: "Premium Certified Quality", desc: "All products sourced directly from certified farms — authentic, fresh, and guaranteed." },
    ar: { title: "جودة معتمدة فاخرة", desc: "جميع منتجاتنا من مزارع معتمدة — أصيلة وطازجة ومضمونة." },
    color: "bg-green-50 text-green-600 border-green-100",
  },
  {
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    en: { title: "Elegant Hand Packaging", desc: "Each gift box is hand-crafted with premium wrapping, ribbons, and luxury presentation." },
    ar: { title: "تغليف يدوي أنيق", desc: "كل صندوق هدايا مُعدّ يدوياً بتغليف فاخر وأشرطة وعرض راقٍ." },
    color: "bg-amber-50 text-amber-600 border-amber-100",
  },
  {
    icon: "M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zM3 9a2 2 0 002-2V5a2 2 0 012-2h10a2 2 0 012 2v2a2 2 0 002 2H3z",
    en: { title: "Every Occasion", desc: "Perfect for Eid, weddings, corporate events, National Day, birthdays, and Ramadan." },
    ar: { title: "لكل مناسبة", desc: "مثالية للعيد والأعراس والفعاليات المؤسسية واليوم الوطني وأعياد الميلاد ورمضان." },
    color: "bg-rose-50 text-rose-600 border-rose-100",
  },
  {
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    en: { title: "Same-Day UAE Delivery", desc: "Same-day and next-day delivery options across all Emirates — fast and fully tracked." },
    ar: { title: "توصيل في نفس اليوم", desc: "خيارات توصيل في نفس اليوم واليوم التالي في جميع الإمارات — سريع ومتتبع بالكامل." },
    color: "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    en: { title: "Custom Bulk Orders", desc: "Volume pricing and fully customizable corporate gift sets for businesses of any size." },
    ar: { title: "طلبات مؤسسية مخصصة", desc: "أسعار الجملة وصناديق هدايا مؤسسية قابلة للتخصيص بالكامل لأي حجم من الأعمال." },
    color: "bg-violet-50 text-violet-600 border-violet-100",
  },
];

function FeatureIcon({ path }: { path: string }) {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

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

export default function GiftBoxesContent() {
  const { lang, tr } = useLanguage();
  const { products, loading } = useProducts();
  const { settings } = useSiteSettings();
  const dir = lang === "ar" ? "rtl" : "ltr";

  const giftBoxProducts = products.filter(
    (p) => p.categorySlug === "gift-boxes" || p.category?.toLowerCase().includes("gift"),
  );

  const whatsappHref = settings.whatsappUrl ?? "https://wa.me/971000000000";

  return (
    <main className="min-h-screen">
      <TopBar />
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink" dir={dir}>
        {/* Decorative gold rings */}
        <div className="pointer-events-none absolute -top-20 -end-20 w-80 h-80 rounded-full border border-gold/10" />
        <div className="pointer-events-none absolute -top-10 -end-10 w-56 h-56 rounded-full border border-gold/10" />
        <div className="pointer-events-none absolute bottom-0 start-0 w-64 h-64 rounded-full bg-gradient-to-tr from-gold/5 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-semibold mb-6">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {lang === "ar" ? "هدايا فاخرة" : "Luxury Gifting"}
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4">
              {lang === "ar" ? (
                <>صناديق هدايا<br /><span className="text-gold">فاخرة ومميزة</span></>
              ) : (
                <>Premium<br /><span className="text-gold">Gift Boxes</span></>
              )}
            </h1>

            <p className="text-white/65 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
              {lang === "ar"
                ? "اكتشف مجموعتنا الراقية من صناديق الهدايا الفاخرة — أجود التمور والقهوة العربية والزعفران والحلويات الإماراتية، مُعدّة بعناية لكل مناسبة."
                : "Discover our curated selection of luxury gift boxes — the finest UAE dates, Arabic coffee, saffron, and traditional sweets, beautifully packaged for every occasion."}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/shop?category=gift-boxes" className="btn-gold">
                {lang === "ar" ? "تسوق صناديق الهدايا" : "Shop Gift Boxes"}
              </Link>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:border-gold hover:text-gold transition-all duration-200 active:scale-95 cursor-pointer">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {lang === "ar" ? "طلب مخصص" : "Custom Orders"}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTRO ────────────────────────────────────────────────────────────── */}
      <section className="py-14 bg-cream" dir={dir}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gold font-semibold text-sm mb-3">
            {lang === "ar" ? "قصتنا في الهدايا" : "Our Gifting Story"}
          </p>
          <h2 className="section-title mb-4">
            {lang === "ar" ? "الهدية المثالية من قلب الإمارات" : "The Perfect Gift from the Heart of UAE"}
          </h2>
          <p className="section-subtitle leading-relaxed">
            {lang === "ar"
              ? "في مربع الغربية، نؤمن أن كل هدية تحمل رسالة. لذلك نختار كل منتج بعناية فائقة، ونُغلّف كل صندوق بأناقة تعكس أصالة الإمارات وكرم الضيافة العربية."
              : "At Marbea Al Gharbeya, we believe every gift carries a message. That's why we hand-select each product with care and package every box with elegance that reflects the authentic heritage and generous spirit of Arabian hospitality."}
          </p>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white" dir={dir}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            badge={lang === "ar" ? "لماذا تختارنا" : "Why Choose Us"}
            title={lang === "ar" ? "ما الذي يجعل صناديقنا مميزة؟" : "What Makes Our Gift Boxes Special?"}
            subtitle={lang === "ar" ? "كل تفصيلة مُصمَّمة لتترك انطباعاً لا يُنسى" : "Every detail designed to leave an unforgettable impression"}
            className="mb-12"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => {
              const t = lang === "ar" ? f.ar : f.en;
              return (
                <div key={i} className="group bg-white rounded-2xl border border-stone-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className={`inline-flex w-12 h-12 rounded-2xl border items-center justify-center mb-4 ${f.color} group-hover:scale-110 transition-transform duration-300`}>
                    <FeatureIcon path={f.icon} />
                  </div>
                  <h3 className="font-bold text-base text-ink mb-2">{t.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{t.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ─────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-cream" dir={dir}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            badge={lang === "ar" ? "مجموعتنا" : "Our Collection"}
            title={lang === "ar" ? "تصفح صناديق الهدايا" : "Browse Gift Boxes"}
            subtitle={lang === "ar" ? "كل صندوق قصة — اختر ما يناسب مناسبتك" : "Every box tells a story — choose the one that fits your occasion"}
            className="mb-10"
          />

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : giftBoxProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {giftBoxProducts.map((p, i) => (
                  <ProductCard key={p.id} product={p} priority={i < 4} />
                ))}
              </div>
              <div className="mt-10 text-center">
                <Link href="/shop?category=gift-boxes" className="btn-outline inline-block">
                  {lang === "ar" ? "عرض جميع صناديق الهدايا" : "View All Gift Boxes"}
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-100">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="font-semibold text-stone-700 mb-1">
                {lang === "ar" ? "صناديق الهدايا قريباً" : "Gift boxes coming soon"}
              </p>
              <p className="text-stone-400 text-sm mb-4">
                {lang === "ar" ? "تصفح كامل المتجر في الوقت الحالي" : "Browse our full shop in the meantime"}
              </p>
              <Link href="/shop" className="btn-primary inline-block">
                {lang === "ar" ? "تصفح المتجر" : "Browse Shop"}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-ink" dir={dir}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-gold/15 text-gold text-xs font-semibold mb-5 border border-gold/30">
            {lang === "ar" ? "طلبات مخصصة" : "Custom Orders"}
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
            {lang === "ar" ? "صمّم صندوق هديتك المثالي" : "Create Your Perfect Gift Box"}
          </h2>
          <p className="text-white/60 text-base leading-relaxed mb-8 max-w-xl mx-auto">
            {lang === "ar"
              ? "هل تحتاج صناديق هدايا بكميات كبيرة لمناسبة مؤسسية؟ تواصل معنا وسنصمم لك تجربة هدايا لا تُنسى."
              : "Need bulk gift boxes for a corporate event? Get in touch and we'll design an unforgettable gifting experience tailored to your brand."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer"
              className="btn-gold inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {lang === "ar" ? "تواصل عبر واتساب" : "WhatsApp Us"}
            </a>
            <Link href="/contact" className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:border-gold hover:text-gold transition-all duration-200 active:scale-95 cursor-pointer">
              {lang === "ar" ? "اتصل بنا" : "Contact Us"}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
