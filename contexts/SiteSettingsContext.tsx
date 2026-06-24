"use client";
import { createContext, useContext } from "react";
import type { SiteSettingsData, FooterSectionData } from "@/lib/site-settings";
import { SITE_SETTINGS_DEFAULTS } from "@/lib/site-settings";

interface CMSContextValue {
  settings: SiteSettingsData;
  footerSections: FooterSectionData[];
}

const SiteSettingsContext = createContext<CMSContextValue>({
  settings: SITE_SETTINGS_DEFAULTS,
  footerSections: [],
});

export function SiteSettingsProvider({
  settings,
  footerSections,
  children,
}: {
  settings: SiteSettingsData;
  footerSections: FooterSectionData[];
  children: React.ReactNode;
}) {
  return (
    <SiteSettingsContext.Provider value={{ settings, footerSections }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
