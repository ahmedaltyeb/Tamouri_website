"use client";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TopBar() {
  const { tr } = useLanguage();
  return (
    <div className="bg-gradient-to-l from-gold to-gold-dark text-white text-center py-2.5 px-4 text-sm font-semibold tracking-wide">
      {tr("topbar")}
    </div>
  );
}
