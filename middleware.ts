// Runs in Edge Runtime — imports only auth.config.ts, never auth.ts.
// auth.ts pulls in Prisma + bcryptjs which are Node.js-only.
import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "ADMIN";

  const isLoginPage = pathname === "/admin/login";
  const isAdminPage = pathname.startsWith("/admin") && !isLoginPage;
  const isAdminApi = pathname.startsWith("/api/admin");

  // Logged-in admin hitting the login page → send to dashboard
  if (isLoginPage && isLoggedIn && isAdmin) {
    return NextResponse.redirect(new URL("/admin/products", req.url));
  }

  // Admin API — 401 JSON for unauthenticated/unauthorized requests
  if (isAdminApi && (!isLoggedIn || !isAdmin)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Admin pages — redirect to login, preserving intended destination
  if (isAdminPage && (!isLoggedIn || !isAdmin)) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
