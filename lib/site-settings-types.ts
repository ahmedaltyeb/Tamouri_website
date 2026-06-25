// ── Shared type definitions and static defaults ───────────────────────────────
//
// This file is intentionally Prisma-free so it can be safely imported by
// "use client" components and contexts without pulling server-only modules
// into the browser bundle.
//
// Server-side functions that actually query the DB live in lib/site-settings.ts.

import { type ThemeColors, DEFAULT_THEME } from "@/lib/theme";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SiteSettingsData {
  id: string;
  nameEn: string;
  nameAr: string;
  taglineEn: string;
  taglineAr: string;
  logo: string | null;
  favicon: string | null;
  phone: string;
  whatsapp: string;
  email: string;
  addressEn: string;
  addressAr: string;
  workingHours: string;
  instagramUrl: string | null;
  twitterUrl: string | null;
  whatsappUrl: string | null;
  seoTitleEn: string;
  seoTitleAr: string;
  seoDescEn: string;
  seoDescAr: string;
  ogImage: string | null;
  themeColors: ThemeColors;
}

export interface FooterLinkData {
  labelEn: string;
  labelAr: string;
  url: string;
}

export interface FooterSectionData {
  id: string;
  order: number;
  titleEn: string;
  titleAr: string;
  links: FooterLinkData[];
}

export interface PaymentMethodData {
  id: string;
  name: string;
  image: string;
  enabled: boolean;
  sortOrder: number;
}

export interface HeroSlideData {
  id: string;
  order: number;
  image: string;
  titleEn: string | null;
  titleAr: string | null;
  subtitleEn: string | null;
  subtitleAr: string | null;
  ctaLabelEn: string | null;
  ctaLabelAr: string | null;
  ctaUrl: string | null;
}

// ── Static defaults ───────────────────────────────────────────────────────────
// Used as fallback when DB has no data, and as the initial context value in
// SiteSettingsContext so providers can render before data arrives.

export const SITE_SETTINGS_DEFAULTS: SiteSettingsData = {
  id: "",
  nameEn: "Marbea Al Gharbeya",
  nameAr: "مربع الغربية",
  taglineEn: "Dates & Coffee",
  taglineAr: "للتمور والقهوة",
  logo: null,
  favicon: null,
  phone: "+971 50 000 0000",
  whatsapp: "+971529307250",
  email: "info@tamouri.ae",
  addressEn: "Abu Dhabi, UAE",
  addressAr: "أبوظبي، الإمارات",
  workingHours: "Daily 8:00 AM – 11:00 PM",
  instagramUrl: null,
  twitterUrl: null,
  whatsappUrl: null,
  seoTitleEn: "Marbea Al Gharbeya Dates | Premium UAE Dates & Coffee",
  seoTitleAr: "مربع الغربية للتمور | تمور وقهوة عربية فاخرة",
  seoDescEn: "Premium UAE dates, Arabic coffee, saffron & tea — delivered across the UAE.",
  seoDescAr: "تمور إماراتية فاخرة، قهوة عربية، زعفران وشاي — توصيل سريع في الإمارات.",
  ogImage: null,
  themeColors: DEFAULT_THEME,
};

// ── Helper (also Prisma-free) ─────────────────────────────────────────────────

export function parseFooterLinks(raw: string): FooterLinkData[] {
  try {
    const parsed = JSON.parse(raw) as FooterLinkData[];
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}
