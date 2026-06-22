import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,

  basePath: "/Tamouri_website",
  assetPrefix: "/Tamouri_website/",

  // Expose basePath to client components so local <img> tags get the right prefix
  env: {
    NEXT_PUBLIC_BASE_PATH: "/Tamouri_website",
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
