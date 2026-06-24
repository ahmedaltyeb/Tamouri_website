// Runs in Edge Runtime — imports only auth.config.ts, never auth.ts.
// Customer session verification uses jose directly (Edge-compatible).
import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";
import { getCustomerFromRequest } from "@/lib/customer-auth";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

const VALID_LANGS = new Set(["ar", "en"]);
const DEFAULT_LANG = "ar";

export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  // ── 1. Admin & API — bypass all lang logic ────────────────────────────────
  const isAdminPath = pathname.startsWith("/admin");
  const isApiPath = pathname.startsWith("/api");

  if (isAdminPath || isApiPath) {
    const isLoggedIn = !!req.auth;
    const isAdminRole = req.auth?.user?.role === "ADMIN";
    const isLoginPage = pathname === "/admin/login";
    const isAdminPage = isAdminPath && !isLoginPage;
    const isAdminApi = pathname.startsWith("/api/admin");

    if (isLoginPage && isLoggedIn && isAdminRole) {
      return NextResponse.redirect(new URL("/admin/products", req.url));
    }
    if (isAdminApi && (!isLoggedIn || !isAdminRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (isAdminPage && (!isLoggedIn || !isAdminRole)) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ── 2. Parse lang prefix — /ar/shop → lang=ar, stripped=/shop ─────────────
  const langMatch = pathname.match(/^\/(ar|en)(\/.*)?$/);
  const urlLang = langMatch?.[1] as string | undefined;
  const strippedPath = langMatch ? (langMatch[2] || "/") : pathname;

  // ── 3. No lang prefix on public path → redirect to /{lang}{path} ──────────
  if (!urlLang) {
    const cookieVal = req.cookies.get("lang")?.value;
    const lang = VALID_LANGS.has(cookieVal ?? "") ? cookieVal! : DEFAULT_LANG;
    const target = pathname === "/" ? `/${lang}` : `/${lang}${pathname}`;
    const redirectUrl = new URL(target, req.url);
    redirectUrl.search = req.nextUrl.search;
    return NextResponse.redirect(redirectUrl);
  }

  // ── 4. Customer auth — use stripped path ──────────────────────────────────
  const isProtectedAccount =
    strippedPath.startsWith("/account/profile") ||
    strippedPath.startsWith("/account/orders") ||
    strippedPath.startsWith("/account/addresses") ||
    strippedPath.startsWith("/account/wishlist");

  if (isProtectedAccount) {
    const customer = await getCustomerFromRequest(req as unknown as NextRequest);
    if (!customer) {
      const loginUrl = new URL(`/${urlLang}/account/login`, req.url);
      loginUrl.searchParams.set("from", `/${urlLang}${strippedPath}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  const isCustomerAuthPage =
    strippedPath === "/account/login" || strippedPath === "/account/register";
  if (isCustomerAuthPage) {
    const customer = await getCustomerFromRequest(req as unknown as NextRequest);
    if (customer) {
      return NextResponse.redirect(new URL(`/${urlLang}/account/profile`, req.url));
    }
  }

  // ── 5. Rewrite /ar/shop → /shop, inject lang into request headers ─────────
  // Setting headers on the *request* (not response) makes them available
  // to server components via `await headers()` from next/headers.
  const rewriteTarget = new URL(strippedPath, req.url);
  rewriteTarget.search = req.nextUrl.search;

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-next-lang", urlLang);
  requestHeaders.set("x-next-path", pathname); // full original path for hreflang

  // Keep cookie in sync with URL lang (so shared /en/* links update recipient's pref)
  const response = NextResponse.rewrite(rewriteTarget, {
    request: { headers: requestHeaders },
  });
  if (req.cookies.get("lang")?.value !== urlLang) {
    response.cookies.set("lang", urlLang, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  return response;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
