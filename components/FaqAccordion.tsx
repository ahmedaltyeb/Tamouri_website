"use client";
import { useState } from "react";

export interface FaqItem {
  q: string;
  a: string;
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden"
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-start cursor-pointer hover:bg-stone-50 transition-colors"
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-stone-800 text-sm leading-snug">
                {item.q}
              </span>
              <span
                className={`flex-none w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isOpen ? "bg-gold text-white rotate-45" : "bg-stone-100 text-stone-500"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </span>
            </button>

            <div
              className={`grid transition-all duration-200 ease-in-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-stone-500 text-sm leading-relaxed border-t border-stone-50 pt-3">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
