"use client";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Hero() {
  const { tr } = useLanguage();

  return (
    <section className="relative min-h-[560px] md:min-h-[640px] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?w=1600&q=85"
          alt="UAE hospitality products"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-l from-ink/80 via-ink/50 to-ink/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
      </div>

      <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-brown/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 bg-gold/20 backdrop-blur-sm border border-gold/30 text-gold px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            <span>{tr("heroBadge")}</span>
            <span>🇦🇪</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.2] mb-4">
            {tr("heroTitle1")}
            <br />
            <span className="text-gold">{tr("heroTitle2")}</span>
            <br />
            {tr("heroTitle3")}
          </h1>

          <p className="text-white/80 text-base md:text-lg font-medium mb-8 leading-relaxed">
            {tr("heroSub1")}
            <br />
            <span className="text-gold/90">{tr("heroSub2")}</span>
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all duration-200 shadow-lg shadow-gold/30 hover:shadow-gold/50 active:scale-95 cursor-pointer"
            >
              <span>{tr("heroShopNow")}</span>
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          <div className="flex items-center gap-6 mt-10">
            {[
              { value: tr("stat1Value"), label: tr("stat1Label") },
              { value: tr("stat2Value"), label: tr("stat2Label") },
              { value: tr("stat3Value"), label: tr("stat3Label") },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
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
