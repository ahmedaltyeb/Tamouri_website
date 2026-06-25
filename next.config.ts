import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Prevent webpack from trying to bundle these native/server-only packages.
  // Prisma's query engine includes .node binaries that can't be webpack-bundled.
  serverExternalPackages: ["@prisma/client", "prisma", "bcryptjs", "@prisma/adapter-pg", "pg"],

  // Silence the "multiple lockfiles" Turbopack workspace-root warning.
  // Explicitly declare this directory as the project root.
  turbopack: {
    root: path.resolve(__dirname),
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Allow any HTTPS hostname so admins can paste external product image URLs
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
