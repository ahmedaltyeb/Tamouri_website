import type { Metadata } from "next";
import TopBar from "@/components/TopBar";

export const metadata: Metadata = {
  title: "مربع الغربية للتمور — تمور فاخرة وقهوة عربية وزعفران",
  description:
    "اكتشف أجود التمور الإماراتية والقهوة العربية والزعفران والشاي. هدايا فاخرة وبوكسات ضيافة بتوصيل سريع لجميع الإمارات. Explore premium UAE dates, Arabic coffee, saffron & gift boxes delivered across the UAE.",
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL ?? "https://tamouri.onrender.com",
  },
  openGraph: {
    title: "مربع الغربية للتمور — تمور فاخرة وقهوة عربية",
    description: "أجود التمور الإماراتية والقهوة العربية والزعفران — هدايا فاخرة بتوصيل للإمارات.",
    url: process.env.NEXT_PUBLIC_BASE_URL ?? "https://tamouri.onrender.com",
    type: "website",
  },
};

import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryCards from "@/components/CategoryCards";
import FeaturedProducts from "@/components/FeaturedProducts";
import HeroSlider from "@/components/HeroSlider";
import WhyTamouri from "@/components/WhyTamouri";
import SplitCollections from "@/components/SplitCollections";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

async function getHomepageSections() {
  try {
    const rows = await prisma.homepageSection.findMany({ where: { active: true } });
    return Object.fromEntries(rows.map((s) => [s.key, s]));
  } catch {
    return {} as Record<string, never>;
  }
}

export default async function HomePage() {
  const sections = await getHomepageSections();

  return (
    <main className="min-h-screen">
      <TopBar />
      <Header />
      <Hero />
      <CategoryCards section={sections["shop_categories"] ?? null} />
      <FeaturedProducts section={sections["featured_products"] ?? null} />
      <SplitCollections section={sections["split_collections"] ?? null} />
      <HeroSlider />
      <WhyTamouri section={sections["why_us"] ?? null} />
      <Testimonials section={sections["testimonials"] ?? null} />
      <Footer />
    </main>
  );
}
