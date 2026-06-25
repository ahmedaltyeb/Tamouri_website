"use client";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import BASE_PATH from "@/lib/basePath";

export default function Hero() {
  const { tr, lang } = useLanguage();

  return (
    <section className="relative min-h-[560px] md:min-h-[640px] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${BASE_PATH}/assets/slider/heroSlider-8.png`}
          alt="UAE hospitality products"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-ink/60" />
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gold/20 backdrop-blur-sm border border-gold/30 text-gold px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            <span>{tr("heroBadge")}</span>
            <span>🇦🇪</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.2] mb-4 text-start">
            {tr("heroTitle1")}{" "}
            <span className="text-gold">{tr("heroTitle2")}</span>{" "}
            {tr("heroTitle3")}
          </h1>

          <p className="text-white/80 text-base md:text-lg font-medium mb-8 leading-relaxed text-start">
            {tr("heroSub1")}
          </p>

          <div className="flex flex-wrap items-center justify-start gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all duration-200 shadow-lg shadow-gold/30 active:scale-95 cursor-pointer"
            >
              <span>{tr("heroShopNow")}</span>
              <svg className={`w-4 h-4 ${lang === "ar" ? "" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/shop?category=gift-boxes"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all duration-200 hover:bg-white/20 active:scale-95 cursor-pointer"
            >
              {tr("heroGiftBoxes")}
            </Link>
          </div>

          <div className="flex items-center justify-start gap-8 md:gap-14 mt-10">
            {[
              { value: tr("stat1Value"), label: tr("stat1Label") },
              { value: tr("stat2Value"), label: tr("stat2Label") },
              { value: tr("stat3Value"), label: tr("stat3Label") },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-black text-gold">{stat.value}</div>
                <div className="text-white/70 text-xs font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
