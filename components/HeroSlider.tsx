"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?w=1400&q=85",
    alt: "تمور فاخرة",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1400&q=85",
    alt: "قهوة عربية",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1400&q=85",
    alt: "هدايا الضيافة",
  },
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
    <section className="relative w-full overflow-hidden" style={{ height: "clamp(220px, 40vw, 500px)" }}>
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          <Image src={s.image} alt={s.alt} fill className="object-cover" priority={i === 0} sizes="100vw" />
        </div>
      ))}

      {/* Arrows */}
      <button onClick={prev} aria-label="previous" className="absolute start-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-black/25 hover:bg-black/45 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button onClick={next} aria-label="next" className="absolute end-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-black/25 hover:bg-black/45 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 cursor-pointer ${i === current ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/50 hover:bg-white/80"}`}
          />
        ))}
      </div>
    </section>
  );
}
