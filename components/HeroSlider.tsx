"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

/*
  To use your own images:
  1. Drop files into  public/assets/slider/
  2. Name them:       slide-1.jpg, slide-2.jpg, slide-3.jpg  (or .png / .webp)
  3. Update the `slides` array below — change `image` to "/assets/slider/slide-1.jpg" etc.
*/

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?w=1400&q=85",
    titleAr: "تمور فاخرة\nمن قلب الخليج",
    titleEn: "Premium Dates\nfrom the Gulf",
    subtitleAr: "اختر من أجود أنواع التمور الإماراتية",
    subtitleEn: "Choose from the finest UAE date varieties",
    ctaAr: "تسوق التمور",
    ctaEn: "Shop Dates",
    href: "/shop?category=dates",
    overlay: "from-ink/70 via-ink/40 to-transparent",
    accent: "bg-gold",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1400&q=85",
    titleAr: "قهوة عربية\nأصيلة بكل قطرة",
    titleEn: "Authentic Arabic\nCoffee in Every Sip",
    subtitleAr: "حبوب مختارة ومطحونة بعناية فائقة",
    subtitleEn: "Carefully selected and freshly ground beans",
    ctaAr: "تسوق القهوة",
    ctaEn: "Shop Coffee",
    href: "/shop?category=arabic-coffee",
    overlay: "from-brown/80 via-brown/40 to-transparent",
    accent: "bg-brown",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1400&q=85",
    titleAr: "هدايا الضيافة\nللمناسبات الخاصة",
    titleEn: "Hospitality Gift Boxes\nfor Every Occasion",
    subtitleAr: "بوكسات هدايا فاخرة لكل مناسبة",
    subtitleEn: "Luxury gift sets beautifully packaged",
    ctaAr: "تسوق الهدايا",
    ctaEn: "Shop Gifts",
    href: "/shop?category=gift-boxes",
    overlay: "from-ink/65 via-ink/35 to-transparent",
    accent: "bg-gold",
  },
];

export default function HeroSlider() {
  const { lang } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = useCallback((idx: number) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(idx);
    setTimeout(() => setAnimating(false), 500);
  }, [animating]);

  const prev = useCallback(() => go((current - 1 + slides.length) % slides.length), [current, go]);
  const next = useCallback(() => go((current + 1) % slides.length), [current, go]);

  // Auto-advance every 5 s
  useEffect(() => {
    const t = setTimeout(next, 5000);
    return () => clearTimeout(t);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="relative w-full overflow-hidden" style={{ height: "clamp(340px, 55vw, 620px)" }}>

      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          <Image
            src={s.image}
            alt={lang === "ar" ? s.titleAr : s.titleEn}
            fill
            className="object-cover"
            priority={i === 0}
            sizes="100vw"
          />
          <div className={`absolute inset-0 bg-gradient-to-l ${s.overlay}`} />
        </div>
      ))}

      {/* Content */}
      <div
        className="relative z-20 h-full flex items-center"
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 w-full">
          <div className="max-w-lg">
            <div
              key={`${current}-text`}
              className="animate-slide-up"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4 whitespace-pre-line drop-shadow-lg">
                {lang === "ar" ? slide.titleAr : slide.titleEn}
              </h2>
              <p className="text-white/85 text-sm sm:text-base font-medium mb-6 drop-shadow">
                {lang === "ar" ? slide.subtitleAr : slide.subtitleEn}
              </p>
              <Link
                href={slide.href}
                className={`inline-flex items-center gap-2 ${slide.accent} hover:opacity-90 text-white px-7 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 cursor-pointer shadow-lg`}
              >
                {lang === "ar" ? slide.ctaAr : slide.ctaEn}
                <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Arrow buttons */}
      <button
        onClick={prev}
        className="absolute start-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90"
        aria-label="previous"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute end-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90"
        aria-label="next"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`rounded-full transition-all duration-300 cursor-pointer ${
              i === current
                ? "w-6 h-2 bg-white"
                : "w-2 h-2 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute top-4 end-4 z-30 bg-black/30 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
        {current + 1} / {slides.length}
      </div>
    </section>
  );
}
