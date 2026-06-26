import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import GiftBoxesContent from "./_content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Premium Gift Boxes — UAE Dates, Arabic Coffee & Luxury Gift Sets | مربع الغربية",
  description:
    "Shop luxury gift boxes featuring the finest UAE dates, Arabic coffee, saffron & sweets. Perfect for Eid, weddings, and corporate gifting. Same-day delivery across UAE.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://tamouri.onrender.com"}/gift-boxes`,
  },
  openGraph: {
    title: "Premium Gift Boxes — Luxury UAE Gifting",
    description: "Curated luxury gift boxes with the finest dates, Arabic coffee, saffron & sweets. Hand-packaged for every occasion.",
    type: "website",
  },
};

export default async function GiftBoxesPage() {
  const page = await prisma.page.findUnique({
    where: { slug: "gift-boxes" },
    select: { heroImage: true, heroImageAltEn: true, heroImageAltAr: true },
  }).catch(() => null);

  return (
    <GiftBoxesContent
      heroImage={page?.heroImage ?? null}
      heroImageAltEn={page?.heroImageAltEn ?? null}
      heroImageAltAr={page?.heroImageAltAr ?? null}
    />
  );
}
