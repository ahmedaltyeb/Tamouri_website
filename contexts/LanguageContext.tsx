"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import t, { type Lang, type TranslationKey } from "@/lib/translations";

const STORAGE_KEY = "tamouri_lang";
const COOKIE_NAME = "lang";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function setLangCookie(l: Lang) {
  document.cookie = `${COOKIE_NAME}=${l}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

/** Strip /ar or /en prefix from a pathname — "/ar/shop" → "/shop" */
function stripLangPrefix(p: string): string {
  return p.replace(/^\/(ar|en)/, "") || "/";
}

interface LanguageContextValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (l: Lang) => void;
  tr: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "ar",
  dir: "rtl",
  setLang: () => {},
  tr: (key) => t.ar[key],
});

interface Props {
  children: ReactNode;
  /**
   * Language resolved server-side from the URL prefix (x-next-lang header).
   * Passed from RootLayout — eliminates the AR→EN flash on first paint.
   */
  initialLang?: Lang;
}

export function LanguageProvider({ children, initialLang = "ar" }: Props) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const router = useRouter();
  const pathname = usePathname(); // e.g. "/ar/shop" — the browser URL

  // Keep state in sync when initialLang prop changes (happens on Next.js navigation
  // between different lang prefixes, e.g. /ar/shop → /en/shop via router.push).
  const prevInitialLang = useRef(initialLang);
  if (prevInitialLang.current !== initialLang) {
    prevInitialLang.current = initialLang;
    setLangState(initialLang);
  }

  // On first mount: sync cookie + localStorage with the server-resolved lang.
  // DOM lang/dir are already correct from SSR <html> attributes.
  useEffect(() => {
    setLangCookie(initialLang);
    localStorage.setItem(STORAGE_KEY, initialLang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally runs once — initialLang is stable on mount

  /**
   * Switch language:
   *  1. Update React state immediately (instant UI update)
   *  2. Sync cookie + localStorage
   *  3. Navigate to the equivalent URL in the new language
   *     e.g. /ar/shop → /en/shop
   */
  const setLang = useCallback(
    (l: Lang) => {
      if (l === lang) return;
      setLangState(l);
      setLangCookie(l);
      localStorage.setItem(STORAGE_KEY, l);
      document.documentElement.lang = l;
      document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
      const stripped = stripLangPrefix(pathname);
      router.push(`/${l}${stripped === "/" ? "" : stripped}`);
    },
    [lang, pathname, router]
  );

  const tr = useCallback(
    (key: TranslationKey) => t[lang][key] as string,
    [lang]
  );

  const dir: "rtl" | "ltr" = lang === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ lang, dir, setLang, tr }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
