"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const slides = [
  { id: 1, image: "/assets/slider/slide-1.png",  alt: "slide 1" },
  { id: 2, image: "/assets/slider/slide-1.webp", alt: "slide 2" },
  { id: 3, image: "/assets/slider/slide-2.png",  alt: "slide 3" },
  { id: 4, image: "/assets/slider/slide-2.webp", alt: "slide 4" },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const t = setTimeout(next, 5000);
    return () => clearTimeout(t);
  }, [next, current]);

  return (
    <section className="relative w-full overflow-hidden">
      {/*
        Aspect-ratio container:
          mobile  → 4:3  (padding-top 75%)
          tablet  → 16:7 (padding-top ~43.75%)
          desktop → 16:5 (padding-top ~31.25%)
        The image fills the container at every breakpoint.
      */}
      {/* 768/1376 = 55.81% — exact aspect ratio of the source images */}
      <div className="relative w-full pt-[55.81%]">

        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={s.image}
              alt={s.alt}
              fill
              className="object-contain object-center"
              priority={i === 0}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
            />
          </div>
        ))}

        {/* Prev arrow */}
        <button
          onClick={prev}
          aria-label="previous"
          className="absolute start-3 sm:start-5 top-1/2 -translate-y-1/2 z-20
                     w-8 h-8 sm:w-10 sm:h-10
                     bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white
                     rounded-full flex items-center justify-center
                     transition-all cursor-pointer active:scale-90"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Next arrow */}
        <button
          onClick={next}
          aria-label="next"
          className="absolute end-3 sm:end-5 top-1/2 -translate-y-1/2 z-20
                     w-8 h-8 sm:w-10 sm:h-10
                     bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white
                     rounded-full flex items-center justify-center
                     transition-all cursor-pointer active:scale-90"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === current
                  ? "w-5 sm:w-6 h-2 bg-white"
                  : "w-2 h-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
