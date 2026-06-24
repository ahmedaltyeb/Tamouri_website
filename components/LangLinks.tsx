/**
 * Server component — renders <link rel="canonical"> and <link rel="alternate">
 * hreflang tags in <head> for every public page.
 *
 * Reads x-next-lang and x-next-path from request headers set by middleware.
 * No props needed — self-contained.
 */
import { getLang, getCurrentPath } from "@/lib/server-lang";

const BASE =
  (process.env.NEXT_PUBLIC_BASE_URL ?? "https://tamouri.onrender.com").replace(/\/$/, "");

export default async function LangLinks() {
  const lang = await getLang();
  const path = await getCurrentPath(); // e.g. "/shop" or "/"

  // Normalise: "/" stays "/", "/shop" stays "/shop"
  const slug = path === "/" ? "" : path;

  const arUrl = `${BASE}/ar${slug}`;
  const enUrl = `${BASE}/en${slug}`;
  const canonical = lang === "ar" ? arUrl : enUrl;

  return (
    <>
      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="ar" href={arUrl} />
      <link rel="alternate" hrefLang="en" href={enUrl} />
      {/* x-default points to the primary locale (Arabic) */}
      <link rel="alternate" hrefLang="x-default" href={arUrl} />
    </>
  );
}
