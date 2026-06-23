import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
