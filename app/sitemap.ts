import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// Render at request time so crawlers always get fresh URLs
export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://tamouri.onrender.com";

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: BASE,                    lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
  { url: `${BASE}/shop`,          lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
  { url: `${BASE}/track-order`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  { url: `${BASE}/contact`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { inStock: true },
      select: { id: true, updatedAt: true },
    }),
    prisma.product.findMany({
      where: { inStock: true },
      select: { categorySlug: true },
      distinct: ["categorySlug"],
    }),
  ]);

  const categoryUrls: MetadataRoute.Sitemap = categories.map(({ categorySlug }) => ({
    url: `${BASE}/shop?category=${categorySlug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productUrls: MetadataRoute.Sitemap = products.map(({ id, updatedAt }) => ({
    url: `${BASE}/product/${id}`,
    lastModified: updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...STATIC_PAGES, ...categoryUrls, ...productUrls];
}
