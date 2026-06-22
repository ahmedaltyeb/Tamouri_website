import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // 👈 required for static site export

  images: {
    unoptimized: true, // 👈 required (Next Image optimization won't work on static hosting)

    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
