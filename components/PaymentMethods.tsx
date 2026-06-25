"use client";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

// Shown when the DB table has no rows yet
const STATIC_FALLBACK = [
  { id: "visa",     name: "Visa" },
  { id: "mc",       name: "Mastercard" },
  { id: "applepay", name: "Apple Pay" },
  { id: "tabby",    name: "Tabby" },
  { id: "tamara",   name: "Tamara" },
];

interface Props {
  /** "dark" = footer-on-dark-bg pill style; "light" (default) = white card style */
  variant?: "light" | "dark";
  className?: string;
}

export default function PaymentMethods({ variant = "light", className = "" }: Props) {
  const { paymentMethods } = useSiteSettings();
  const enabled = paymentMethods.filter((m) => m.enabled);

  const wrapClass = `flex flex-wrap gap-2 ${className}`;

  if (enabled.length > 0) {
    return (
      <div className={wrapClass}>
        {enabled.map((m) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={m.id}
            src={m.image}
            alt={m.name}
            title={m.name}
            className={`h-7 w-auto object-contain rounded px-1.5 py-0.5 hover:opacity-75 transition-opacity ${
              variant === "dark"
                ? "bg-white/10 border border-white/10"
                : "bg-white border border-stone-200 shadow-sm"
            }`}
          />
        ))}
      </div>
    );
  }

  // Fallback: labelled text pills (no images in DB)
  if (variant === "dark") {
    return (
      <div className={wrapClass}>
        {STATIC_FALLBACK.map((m) => (
          <span
            key={m.id}
            className="bg-white/10 border border-white/10 rounded-md px-2.5 py-1.5 text-xs font-bold text-white/70"
          >
            {m.name}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={wrapClass}>
      {STATIC_FALLBACK.map((m) => (
        <span
          key={m.id}
          className="bg-stone-100 border border-stone-200 rounded-md px-2.5 py-1.5 text-xs font-semibold text-stone-500"
        >
          {m.name}
        </span>
      ))}
    </div>
  );
}
