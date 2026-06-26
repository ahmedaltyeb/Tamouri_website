"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import SectionHeader from "@/components/SectionHeader";
import { ICON_PATHS, type IconKey } from "@/lib/cms/icons";

interface CmsFeatureCard {
  id: string;
  icon: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  color: string;
}

// Hardcoded fallback — matches the original 3 cards exactly
const FALLBACK: Omit<CmsFeatureCard, "id">[] = [
  {
    icon: "box",
    titleEn: "Fast & Secure Delivery",
    titleAr: "توصيل سريع وآمن",
    descriptionEn: "Same-day and next-day delivery options across the UAE with real-time tracking.",
    descriptionAr: "خيارات توصيل في نفس اليوم وفي اليوم التالي في جميع أنحاء الإمارات مع التتبع الفوري.",
    color: "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    icon: "shield",
    titleEn: "Guaranteed Authenticity",
    titleAr: "أصالة مضمونة",
    descriptionEn: "All products are sourced directly from certified farms and trusted suppliers.",
    descriptionAr: "جميع المنتجات مصدرها مزارع معتمدة وموردون موثوقون.",
    color: "bg-green-50 text-green-600 border-green-100",
  },
  {
    icon: "dollar",
    titleEn: "Best Value Prices",
    titleAr: "أفضل قيمة مقابل المال",
    descriptionEn: "Competitive pricing with regular offers, loyalty rewards, and bulk discounts.",
    descriptionAr: "أسعار تنافسية مع عروض منتظمة ومكافآت ولاء وخصومات للكميات.",
    color: "bg-amber-50 text-amber-600 border-amber-100",
  },
];

function FeatureIcon({ iconKey, className }: { iconKey: string; className?: string }) {
  const path = ICON_PATHS[iconKey as IconKey];
  if (!path) return null;
  return (
    <svg className={className ?? "w-7 h-7"} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

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

export default function WhyTamouri({ section }: Props) {
  const { lang, tr } = useLanguage();
  const [features, setFeatures] = useState<(CmsFeatureCard | Omit<CmsFeatureCard, "id">)[]>(FALLBACK);

  useEffect(() => {
    fetch("/api/cms/features")
      .then((r) => r.json())
      .then((data: CmsFeatureCard[]) => {
        if (Array.isArray(data) && data.length > 0) setFeatures(data);
      })
      .catch(() => {/* keep fallback */});
  }, []);

  const badge    = (lang === "ar" ? section?.badgeAr    : section?.badgeEn)    ?? tr("whyBadge");
  const title    = (lang === "ar" ? section?.titleAr    : section?.titleEn)    ?? tr("whyTitle");
  const subtitle = (lang === "ar" ? section?.subtitleAr : section?.subtitleEn) ?? tr("whySub");

  return (
    <section className="py-16 bg-gradient-to-b from-white to-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader badge={badge} title={title} subtitle={subtitle} className="mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div key={"id" in feature ? feature.id : idx} className="group bg-white rounded-2xl border border-stone-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-default">
              <div className={`inline-flex w-14 h-14 rounded-2xl border items-center justify-center mb-4 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                <FeatureIcon iconKey={feature.icon} className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg text-ink mb-2">
                {lang === "ar" ? feature.titleAr : feature.titleEn}
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                {lang === "ar" ? feature.descriptionAr : feature.descriptionEn}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-gradient-to-l rtl:bg-gradient-to-r from-brown to-brown-dark rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 text-white">
          <div>
            <h3 className="text-xl font-bold mb-1">{tr("whyCTATitle")}</h3>
            <p className="text-white/70 text-sm">{tr("whyCTASub")}</p>
          </div>
          <Link
            href="/shop"
            className="flex-none bg-gold hover:bg-gold-dark text-white px-8 py-3 rounded-xl font-bold transition-colors cursor-pointer whitespace-nowrap active:scale-95"
          >
            {tr("shopNow")}
          </Link>
        </div>
      </div>
    </section>
  );
}
