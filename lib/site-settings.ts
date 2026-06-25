// Server-only — never import this file in "use client" components.
// Client-safe types and static defaults live in lib/site-settings-types.ts.
import "server-only";

import { prisma } from "@/lib/prisma";
import { parseThemeJson } from "@/lib/theme";
import {
  SITE_SETTINGS_DEFAULTS,
  parseFooterLinks,
  type SiteSettingsData,
  type FooterSectionData,
  type FooterLinkData,
  type HeroSlideData,
  type PaymentMethodData,
} from "@/lib/site-settings-types";

// Re-export types and defaults so callers that already import from this file
// keep working without changes.
export type { SiteSettingsData, FooterSectionData, FooterLinkData, HeroSlideData, PaymentMethodData };
export { SITE_SETTINGS_DEFAULTS, parseFooterLinks };

// ── In-memory cache (resets on server restart — acceptable for CMS data) ──────

let settingsCache: { data: SiteSettingsData; at: number } | null = null;
let footerCache: { data: FooterSectionData[]; at: number } | null = null;
let heroCache: { data: HeroSlideData[]; at: number } | null = null;
let paymentCache: { data: PaymentMethodData[]; at: number } | null = null;
const TTL = 60_000; // 60 seconds

export function invalidateCmsCache() {
  settingsCache = null;
  footerCache = null;
  heroCache = null;
  paymentCache = null;
}

// ── Getters ───────────────────────────────────────────────────────────────────

export async function getSiteSettings(): Promise<SiteSettingsData> {
  if (settingsCache && Date.now() - settingsCache.at < TTL) return settingsCache.data;

  try {
    const row = await prisma.storeSettings.findFirst();
    if (!row) return SITE_SETTINGS_DEFAULTS;

    const data: SiteSettingsData = {
      id: row.id,
      nameEn: row.nameEn ?? row.name ?? SITE_SETTINGS_DEFAULTS.nameEn,
      nameAr: row.nameAr ?? SITE_SETTINGS_DEFAULTS.nameAr,
      taglineEn: row.taglineEn ?? SITE_SETTINGS_DEFAULTS.taglineEn,
      taglineAr: row.taglineAr ?? SITE_SETTINGS_DEFAULTS.taglineAr,
      logo: row.logo ?? null,
      favicon: row.favicon ?? null,
      phone: row.phone ?? SITE_SETTINGS_DEFAULTS.phone,
      whatsapp: row.whatsapp ?? SITE_SETTINGS_DEFAULTS.whatsapp,
      email: row.email ?? SITE_SETTINGS_DEFAULTS.email,
      addressEn: row.addressEn ?? row.location ?? SITE_SETTINGS_DEFAULTS.addressEn,
      addressAr: row.addressAr ?? SITE_SETTINGS_DEFAULTS.addressAr,
      workingHours: row.workingHours ?? SITE_SETTINGS_DEFAULTS.workingHours,
      instagramUrl: row.instagramUrl ?? null,
      twitterUrl: row.twitterUrl ?? null,
      whatsappUrl: row.whatsappUrl ?? null,
      seoTitleEn: row.seoTitleEn ?? SITE_SETTINGS_DEFAULTS.seoTitleEn,
      seoTitleAr: row.seoTitleAr ?? SITE_SETTINGS_DEFAULTS.seoTitleAr,
      seoDescEn: row.seoDescEn ?? SITE_SETTINGS_DEFAULTS.seoDescEn,
      seoDescAr: row.seoDescAr ?? SITE_SETTINGS_DEFAULTS.seoDescAr,
      ogImage: row.ogImage ?? null,
      themeColors: parseThemeJson((row as Record<string, unknown>).themeJson as string | null),
    };

    settingsCache = { data, at: Date.now() };
    return data;
  } catch {
    return SITE_SETTINGS_DEFAULTS;
  }
}

export async function getFooterSections(): Promise<FooterSectionData[]> {
  if (footerCache && Date.now() - footerCache.at < TTL) return footerCache.data;

  try {
    const rows = await prisma.footerSection.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });

    const data: FooterSectionData[] = rows.map((r) => ({
      id: r.id,
      order: r.order,
      titleEn: r.titleEn,
      titleAr: r.titleAr,
      links: parseFooterLinks(r.links),
    }));

    footerCache = { data, at: Date.now() };
    return data;
  } catch {
    return [];
  }
}

export async function getHeroSlides(): Promise<HeroSlideData[]> {
  if (heroCache && Date.now() - heroCache.at < TTL) return heroCache.data;

  try {
    const rows = await prisma.heroSlide.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });

    const data: HeroSlideData[] = rows.map((r) => ({
      id: r.id,
      order: r.order,
      image: r.image,
      titleEn: r.titleEn,
      titleAr: r.titleAr,
      subtitleEn: r.subtitleEn,
      subtitleAr: r.subtitleAr,
      ctaLabelEn: r.ctaLabelEn,
      ctaLabelAr: r.ctaLabelAr,
      ctaUrl: r.ctaUrl,
    }));

    heroCache = { data, at: Date.now() };
    return data;
  } catch {
    return [];
  }
}

export async function getPaymentMethods(): Promise<PaymentMethodData[]> {
  if (paymentCache && Date.now() - paymentCache.at < TTL) return paymentCache.data;

  try {
    const rows = await prisma.paymentMethod.findMany({
      orderBy: { sortOrder: "asc" },
    });

    const data: PaymentMethodData[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      image: r.image,
      enabled: r.enabled,
      sortOrder: r.sortOrder,
    }));

    paymentCache = { data, at: Date.now() };
    return data;
  } catch {
    return [];
  }
}
