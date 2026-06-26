import type { Metadata } from "next";
import WeeklyDealsContent from "./_content";

export const metadata: Metadata = {
  title: "Weekly Deals — Up to 30% Off Dates, Coffee & Gift Boxes UAE | مربع الغربية",
  description:
    "Don't miss this week's best deals on UAE dates, Arabic coffee, saffron & gift boxes. Discounts up to 30% — new offers every Sunday. Fast UAE delivery.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://tamouri.onrender.com"}/weekly-deals`,
  },
  openGraph: {
    title: "Weekly Deals — Best Prices on Premium UAE Products",
    description: "Handpicked weekly discounts on UAE dates, Arabic coffee, saffron & gift boxes. New deals every Sunday.",
    type: "website",
  },
};

export default function WeeklyDealsPage() {
  return <WeeklyDealsContent />;
}
