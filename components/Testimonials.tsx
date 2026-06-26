"use client";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import SectionHeader from "@/components/SectionHeader";

interface CmsTestimonial {
  id: string;
  nameEn: string;
  nameAr: string;
  locationEn: string | null;
  locationAr: string | null;
  reviewEn: string;
  reviewAr: string;
  productEn: string | null;
  productAr: string | null;
  avatar: string | null;
  color: string;
  rating: number;
}

// Hardcoded fallback — shown when DB has no testimonials yet
const FALLBACK: Omit<CmsTestimonial, "id">[] = [
  {
    nameEn: "Fatima Al Zahraa",    nameAr: "فاطمة الزهراء",
    locationEn: "Dubai",           locationAr: "دبي",
    avatar: "ف", rating: 5,
    reviewEn: "Best store for dates and Arabic coffee in the UAE! Products are authentic and high quality, delivery is very fast.",
    reviewAr: "أفضل محل لشراء التمر والقهوة العربية في الإمارات! المنتجات أصيلة وذات جودة عالية، والتوصيل سريع جداً.",
    productEn: "Premium Medjool Dates", productAr: "تمر مجدول فاخر",
    color: "bg-rose-100 text-rose-700",
  },
  {
    nameEn: "Mohammed Khalid Al Ameri", nameAr: "محمد خالد العامري",
    locationEn: "Abu Dhabi",            locationAr: "أبوظبي",
    avatar: "م", rating: 5,
    reviewEn: "I ordered a gift box for Eid and everyone was impressed by the packaging and contents. The saffron is excellent and the coffee is delicious.",
    reviewAr: "طلبت بوكس هدايا للعيد وكان الجميع معجباً بالتغليف والمحتوى. الزعفران الإيراني ممتاز والقهوة لذيذة جداً.",
    productEn: "Premium Hospitality Gift Box", productAr: "بوكس هدايا الضيافة الفاخر",
    color: "bg-blue-100 text-blue-700",
  },
  {
    nameEn: "Noura Mohammed Al Shamsi", nameAr: "نورة محمد الشامسي",
    locationEn: "Sharjah",              locationAr: "الشارقة",
    avatar: "ن", rating: 5,
    reviewEn: "I've shopped at Marbea Al Gharbeya multiple times and I'm always completely satisfied. Reasonable prices and excellent quality.",
    reviewAr: "تعاملت مع مربع الغربية أكثر من مرة وفي كل مرة أكون راضية تماماً. الأسعار معقولة والجودة ممتازة.",
    productEn: "Golden Dallah & Cups Set", productAr: "طقم دلة وفناجين ذهبي",
    color: "bg-amber-100 text-amber-700",
  },
];

interface HomepageSectionData {
  badgeEn?: string | null;
  badgeAr?: string | null;
  titleEn?: string | null;
  titleAr?: string | null;
  subtitleEn?: string | null;
  subtitleAr?: string | null;
}

interface Props {
  section?: HomepageSectionData | null;
}

export default function Testimonials({ section }: Props) {
  const { lang, tr } = useLanguage();
  const [items, setItems] = useState<(CmsTestimonial | Omit<CmsTestimonial, "id">)[]>(FALLBACK);

  useEffect(() => {
    fetch("/api/cms/testimonials")
      .then((r) => r.json())
      .then((data: CmsTestimonial[]) => {
        if (Array.isArray(data) && data.length > 0) setItems(data);
      })
      .catch(() => {/* keep fallback */});
  }, []);

  const badge    = (lang === "ar" ? section?.badgeAr    : section?.badgeEn)    ?? tr("testBadge");
  const title    = (lang === "ar" ? section?.titleAr    : section?.titleEn)    ?? tr("testTitle");
  const subtitle = (lang === "ar" ? section?.subtitleAr : section?.subtitleEn) ?? tr("testSub");

  function getAvatar(t: Omit<CmsTestimonial, "id">) {
    if (t.avatar && t.avatar.length === 1) return t.avatar;
    return (lang === "ar" ? t.nameAr : t.nameEn).charAt(0);
  }

  return (
    <section className="py-16 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader badge={badge} title={title} subtitle={subtitle} className="mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((t, idx) => (
            <div key={"id" in t ? t.id : idx} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-md transition-shadow duration-300">
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-gold fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <svg className="w-8 h-8 text-stone-200 mb-3" fill="currentColor" viewBox="0 0 32 32">
                <path d="M10 8c-3.314 0-6 2.686-6 6v10h10V14H7.5c0-1.38 1.12-2.5 2.5-2.5V8zm18 0c-3.314 0-6 2.686-6 6v10h10V14h-6.5c0-1.38 1.12-2.5 2.5-2.5V8z" />
              </svg>

              <p className="text-stone-600 text-sm leading-relaxed mb-5">
                {lang === "ar" ? t.reviewAr : t.reviewEn}
              </p>

              {(t.productEn || t.productAr) && (
                <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full mb-4 ${t.color}`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {lang === "ar" ? t.productAr : t.productEn}
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-none overflow-hidden ${t.color}`}>
                  {t.avatar?.startsWith("http") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    getAvatar(t)
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm text-ink">{lang === "ar" ? t.nameAr : t.nameEn}</div>
                  <div className="text-stone-400 text-xs">
                    {lang === "ar" ? (t.locationAr ?? "") : (t.locationEn ?? "")}
                  </div>
                </div>
                <div className="me-auto">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
