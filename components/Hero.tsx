"use client";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Hero() {
  const { tr } = useLanguage();

  return (
    <section className="bg-cream py-14 md:py-20 text-center border-b border-stone-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Brand badge pill */}
        <div className="inline-flex items-center gap-2 bg-brown/10 border border-brown/20 text-brown px-5 py-1.5 rounded-full text-sm font-bold mb-6">
          <div className="w-2 h-2 rounded-full bg-gold" />
          تموري
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-ink leading-tight mb-5">
          {tr("heroTitle1")}{" "}
          <span className="text-brown">{tr("heroTitle2")}</span>
          {" "}{tr("heroTitle3")}
        </h1>

        <p className="text-stone-500 text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-8">
          {tr("heroSub1")}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-brown hover:bg-brown-dark text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all duration-200 active:scale-95 cursor-pointer shadow-md shadow-brown/20"
          >
            <span>{tr("heroShopNow")}</span>
            <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/shop?category=gift-boxes"
            className="inline-flex items-center gap-2 border-2 border-brown/30 text-brown px-8 py-3.5 rounded-xl font-bold text-base transition-all duration-200 hover:bg-brown/5 active:scale-95 cursor-pointer"
          >
            {tr("heroGiftBoxes")}
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-8 md:gap-14 mt-10 pt-8 border-t border-stone-200">
          {[
            { value: tr("stat1Value"), label: tr("stat1Label") },
            { value: tr("stat2Value"), label: tr("stat2Label") },
            { value: tr("stat3Value"), label: tr("stat3Label") },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-black text-brown">{stat.value}</div>
              <div className="text-stone-400 text-xs font-medium mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
