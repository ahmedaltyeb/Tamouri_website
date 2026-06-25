"use client";
import { useState, useEffect, useCallback } from "react";
import BASE_PATH from "@/lib/basePath";
import type { HeroSlideData } from "@/lib/site-settings";
import { useLanguage } from "@/contexts/LanguageContext";

interface StaticSlide {
  id: number;
  image: string;
  alt: string;
}

const STATIC_SLIDES: StaticSlide[] = [
  // { id: 1, image: `${BASE_PATH}/assets/slider/heroSlider-5.png`, alt: "slide 1" },
  // { id: 2, image: `${BASE_PATH}/assets/slider/heroSlider-6.png`, alt: "slide 2" },
  // { id: 3, image: `${BASE_PATH}/assets/slider/heroSlider-5.png`, alt: "slide 3" },
];

type AnySlide = HeroSlideData | StaticSlide;

function getImage(s: AnySlide): string {
  return "image" in s ? s.image : "";
}

function getAlt(s: AnySlide, i: number): string {
  if ("alt" in s) return (s as StaticSlide).alt;
  const ds = s as HeroSlideData;
  return ds.titleEn ?? ds.titleAr ?? `slide ${i + 1}`;
}

export default function HeroSlider() {
  const { lang } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [dbSlides, setDbSlides] = useState<HeroSlideData[] | null>(null);

  // Fetch CMS slides once on mount; fall back to static if empty or error
  useEffect(() => {
    fetch("/api/cms/hero")
      .then((r) => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data) && data.length > 0) {
          setDbSlides(data as HeroSlideData[]);
        }
      })
      .catch(() => {
        // stay on static slides
      });
  }, []);

  const slides: AnySlide[] = dbSlides ?? STATIC_SLIDES;

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [slides.length]);

  // Reset index when source changes to avoid out-of-bounds
  useEffect(() => { setCurrent(0); }, [slides.length]);

  useEffect(() => {
    const t = setTimeout(next, 5000);
    return () => clearTimeout(t);
  }, [next, current]);

  return (
    <section className="relative w-full overflow-hidden">
      {/* 768/1376 = 55.81% — exact aspect ratio of source images */}
      <div className="relative w-full pt-[55.81%]">

        {slides.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getImage(s)}
              alt={getAlt(s, i)}
              className="absolute inset-0 w-full h-full object-contain object-center"
            />
          </div>
        ))}

        {/* Prev arrow — points ‹ in LTR (go back), › in RTL (go back = rightward) */}
        <button
          onClick={prev}
          aria-label={lang === "ar" ? "السابق" : "previous"}
          className="absolute start-3 sm:start-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90"
        >
          <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${lang === "ar" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Next arrow */}
        <button
          onClick={next}
          aria-label={lang === "ar" ? "التالي" : "next"}
          className="absolute end-3 sm:end-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90"
        >
          <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${lang === "ar" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots — start-1/2 is the logical equivalent of left-1/2 */}
        <div className="absolute bottom-3 sm:bottom-5 start-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 cursor-pointer ${i === current ? "w-5 sm:w-6 h-2 bg-white" : "w-2 h-2 bg-white/50 hover:bg-white/80"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
