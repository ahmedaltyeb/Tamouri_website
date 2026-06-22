"use client";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function WhyTamouri() {
  const { tr } = useLanguage();

  const features = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      title: tr("why1Title"),
      description: tr("why1Desc"),
      color: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      title: tr("why2Title"),
      description: tr("why2Desc"),
      color: "bg-green-50 text-green-600 border-green-100",
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: tr("why3Title"),
      description: tr("why3Desc"),
      color: "bg-amber-50 text-amber-600 border-amber-100",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-gold font-semibold text-sm mb-2">{tr("whyBadge")}</p>
          <h2 className="section-title">{tr("whyTitle")}</h2>
          <p className="section-subtitle mt-2 max-w-lg mx-auto">{tr("whySub")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="group bg-white rounded-2xl border border-stone-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-default">
              <div className={`inline-flex w-14 h-14 rounded-2xl border items-center justify-center mb-4 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="font-bold text-lg text-ink mb-2">{feature.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Fixed: now uses Next.js Link instead of <a> */}
        <div className="mt-10 bg-gradient-to-l from-brown to-brown-dark rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 text-white">
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
