"use client";
import { createContext, useContext } from "react";
import type { SiteSettingsData, FooterSectionData, PaymentMethodData } from "@/lib/site-settings";
import { SITE_SETTINGS_DEFAULTS } from "@/lib/site-settings";

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
