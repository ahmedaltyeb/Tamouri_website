import NextAuth from "next-auth";
import authConfig from "@/auth.config";

// Edge-compatible auth instance — uses authConfig only (no Prisma, no bcrypt).
// This runs on Vercel Edge before any page render or API handler.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  const isAdminUiRoute =
    pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
  const isAdminApiRoute = pathname.startsWith("/api/admin");

  // Nothing to guard — let it through
  if (!isAdminUiRoute && !isAdminApiRoute) return;

  const isAdmin = req.auth?.user?.role === "ADMIN";

  // Admin API routes → 401 JSON (consumed by fetch, not browser navigation)
  if (isAdminApiRoute && !isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Admin UI routes → redirect to login page
  if (isAdminUiRoute && !isAdmin) {
    const loginUrl = new URL("/admin/login", req.url);
    // Preserve the intended destination so login can redirect back
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  // Run only on admin routes — keeps middleware off public pages (performance)
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
