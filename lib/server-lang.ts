import { headers, cookies } from "next/headers";
import t, { type Lang, type TranslationKey } from "@/lib/translations";

const VALID: Set<string> = new Set(["ar", "en"]);

/**
 * Resolve the current language for server components.
 *
 * Priority:
 *   1. x-next-lang  — set on the rewritten request by middleware (URL is source of truth)
 *   2. lang cookie  — fallback for pages that bypass middleware (e.g. direct /api calls)
 *   3. "ar"         — default
 */
export async function getLang(): Promise<Lang> {
  const reqHeaders = await headers();
  const fromHeader = reqHeaders.get("x-next-lang");
  if (VALID.has(fromHeader ?? "")) return fromHeader as Lang;

  const jar = await cookies();
  const fromCookie = jar.get("lang")?.value;
  return VALID.has(fromCookie ?? "") ? (fromCookie as Lang) : "ar";
}

/** Server-side tr() — pass the lang from getLang() to avoid double await. */
export function serverTr(lang: Lang) {
  return (key: TranslationKey): string => t[lang][key] as string;
}

/**
 * Return the path stripped of its lang prefix — e.g. "/ar/shop" → "/shop".
 * Used by LangLinks to build canonical + hreflang URLs.
 */
export async function getCurrentPath(): Promise<string> {
  const reqHeaders = await headers();
  const full = reqHeaders.get("x-next-path") ?? "/";
  // Strip /ar or /en prefix, keep the rest (including query string is handled separately)
  return full.replace(/^\/(ar|en)/, "") || "/";
}
