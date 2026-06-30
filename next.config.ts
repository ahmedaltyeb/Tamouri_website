import type { NextConfig } from "next";
import path from "node:path";

// ── Security headers applied to every route ───────────────────────────────────
// CSP is intentionally omitted here — Next.js inline scripts require a
// nonce-based CSP which is a separate, larger task.
const SECURITY_HEADERS = [
  // Prevent the site from being embedded in an iframe on another origin
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Stop browsers from MIME-sniffing responses away from the declared Content-Type
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Only send full referrer to same origin; send origin only to cross-origin HTTPS
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features not used by the store
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Allow DNS prefetch for performance
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Force HTTPS for 1 year; include subdomains (Vercel sets this too — explicit is better)
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  // Prevent webpack from trying to bundle these native/server-only packages.
  // Prisma's query engine includes .node binaries that can't be webpack-bundled.
  serverExternalPackages: ["@prisma/client", "prisma", "bcryptjs", "@prisma/adapter-pg", "pg"],

  // Silence the "multiple lockfiles" Turbopack workspace-root warning.
  turbopack: {
    root: path.resolve(__dirname),
  },

  async headers() {
    return [
      {
        // Apply to every route in the app
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },

  images: {
    // Serve AVIF first (30–50% smaller than WebP), fall back to WebP, then original.
    // Vercel Image Optimization handles transcoding at the edge.
    formats: ["image/avif", "image/webp"],

    // Cache optimized images for 30 days on Vercel's CDN.
    // Product images rarely change; admins should update URLs when images change.
    minimumCacheTTL: 2592000,

    remotePatterns: [
      // Common external image sources used in product imports
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "i.ibb.co" },
      // Vercel Blob CDN — production uploads land here
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // ibb image hosting used in some product imports
      { protocol: "https", hostname: "*.ibb.co" },
    ],
  },
};

export default nextConfig;
