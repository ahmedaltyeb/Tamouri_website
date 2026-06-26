import type { Metadata } from "next";
import GiftBoxesContent from "./_content";

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

export default function GiftBoxesPage() {
  return <GiftBoxesContent />;
}
