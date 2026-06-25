"use client";
import { createContext, useContext } from "react";
// Import from the Prisma-free types file — never from lib/site-settings (server-only).
import type { SiteSettingsData, FooterSectionData, PaymentMethodData } from "@/lib/site-settings-types";
import { SITE_SETTINGS_DEFAULTS } from "@/lib/site-settings-types";

interface CMSContextValue {
  settings: SiteSettingsData;
  footerSections: FooterSectionData[];
  paymentMethods: PaymentMethodData[];
}

const SiteSettingsContext = createContext<CMSContextValue>({
  settings: SITE_SETTINGS_DEFAULTS,
  footerSections: [],
  paymentMethods: [],
});

export function SiteSettingsProvider({
  settings,
  footerSections,
  paymentMethods,
  children,
}: {
  settings: SiteSettingsData;
  footerSections: FooterSectionData[];
  paymentMethods: PaymentMethodData[];
  children: React.ReactNode;
}) {
  return (
    <SiteSettingsContext.Provider value={{ settings, footerSections, paymentMethods }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
