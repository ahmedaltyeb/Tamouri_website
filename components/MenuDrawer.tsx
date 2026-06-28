"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePathname } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MenuItem {
  id: string;
  titleEn: string;
  titleAr: string;
  type: string;         // "url" | "category" | "page" | "external"
  url: string | null;
  targetId: string | null;
  icon: string | null;
  image: string | null;
  badge: string | null;
  openInNewTab: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

// ── URL resolver ──────────────────────────────────────────────────────────────

function resolveUrl(item: MenuItem): string {
  if (item.type === "category" && item.targetId) return `/shop?category=${item.targetId}`;
  if (item.type === "page"     && item.targetId) return `/pages/${item.targetId}`;
  return item.url ?? "#";
}

// ── Badge chip ────────────────────────────────────────────────────────────────

function BadgeChip({ text }: { text: string }) {
  const lower = text.toLowerCase();
  const cls =
    lower === "hot"  ? "bg-red-500 text-white" :
    lower === "new"  ? "bg-emerald-500 text-white" :
    lower === "sale" ? "bg-amber-500 text-white" :
                       "bg-stone-200 text-stone-700";
  return (
    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full leading-none ${cls}`}>
      {text}
    </span>
  );
}

// ── Main drawer ───────────────────────────────────────────────────────────────
// Slides in from the RIGHT — matches store's RTL Arabic layout and reference design.
// right-0 + translate-x-full (hidden) → translate-x-0 (visible)

export default function MenuDrawer({ open, onClose }: Props) {
  const { lang, dir } = useLanguage();
  const pathname = usePathname();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Fetch every time the drawer opens — reset on close so CMS changes
  // appear immediately on the next open without serving stale data.
  useEffect(() => {
    if (!open) { setLoaded(false); return; }
    fetch("/api/menu")
      .then((r) => r.json())
      .then((data: MenuItem[]) => { setItems(data); setLoaded(true); })
      .catch(() => { setItems([]); setLoaded(true); });
  }, [open]);

  // Close on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  const isActive = (item: MenuItem) => {
    const url = resolveUrl(item);
    if (url === "/") return pathname === "/";
    return url !== "#" && pathname.startsWith(url.split("?")[0]);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer — slides from right */}
      <div
        dir={dir}
        role="dialog"
        aria-modal="true"
        aria-label={lang === "ar" ? "القائمة الرئيسية" : "Main menu"}
        className={`fixed top-0 bottom-0 right-0 z-50 w-80 bg-white shadow-2xl flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header — dark brown bar matching reference design */}
        <div className="flex items-center justify-between px-5 py-4 bg-brown-dark text-white flex-none">
          <button
            onClick={onClose}
            aria-label={lang === "ar" ? "إغلاق القائمة" : "Close menu"}
            className="p-1 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <h2 className="text-base font-bold">
            {lang === "ar" ? "القائمة" : "Menu"}
          </h2>
        </div>

        {/* Item list */}
        <nav className="flex-1 overflow-y-auto" aria-label={lang === "ar" ? "روابط التنقل" : "Navigation links"}>
          {!loaded ? (
            <div className="py-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="px-5 py-3.5 border-b border-stone-100 flex justify-end">
                  <div className="h-4 bg-stone-100 rounded animate-pulse" style={{ width: `${55 + (i % 3) * 15}%` }} />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-stone-400 text-sm py-12">
              {lang === "ar" ? "لا توجد عناصر في القائمة" : "No menu items configured"}
            </p>
          ) : (
            <ul>
              {items.map((item) => {
                const href = resolveUrl(item);
                const title = lang === "ar" ? item.titleAr : item.titleEn;
                const active = isActive(item);
                const linkProps = item.openInNewTab
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {};

                return (
                  <li key={item.id} className="border-b border-stone-100 last:border-b-0">
                    <Link
                      href={href}
                      onClick={onClose}
                      {...linkProps}
                      className={`flex items-center justify-between gap-3 px-5 py-3.5 text-base transition-colors duration-150 cursor-pointer
                        ${active
                          ? "bg-brown/5 text-brown font-semibold"
                          : "text-stone-800 hover:bg-stone-50 hover:text-brown font-normal"
                        }`}
                    >
                      {/* Badges / external icon — left side (appears right in RTL) */}
                      <span className="flex items-center gap-1.5 flex-none">
                        {item.badge && <BadgeChip text={item.badge} />}
                        {item.openInNewTab && (
                          <svg className="w-3 h-3 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                          </svg>
                        )}
                      </span>

                      {/* Title — text-end aligns right in RTL, left in LTR */}
                      <span className="flex-1 text-end">{title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>
      </div>
    </>
  );
}
