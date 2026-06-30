import type { Metadata } from "next";
import { Suspense } from "react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";

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

// ISR: revalidate CMS section data every 60 seconds.
// Hero renders immediately; below-fold sections stream in after DB resolves.
export const revalidate = 60;

import { prisma } from "@/lib/prisma";
import CategoryCards from "@/components/CategoryCards";
import FeaturedProducts from "@/components/FeaturedProducts";
import HeroSlider from "@/components/HeroSlider";
import WhyTamouri from "@/components/WhyTamouri";
import SplitCollections from "@/components/SplitCollections";
import Testimonials from "@/components/Testimonials";

async function getHomepageSections() {
  try {
    const rows = await prisma.homepageSection.findMany({ where: { active: true } });
    return Object.fromEntries(rows.map((s) => [s.key, s]));
  } catch {
    return {} as Record<string, never>;
  }
}

// Async server component that owns the DB fetch — wrapped in Suspense below.
// Separating it lets Hero paint on the first HTML flush before the DB responds.
async function BelowFold() {
  const sections = await getHomepageSections();
  return (
    <>
      <CategoryCards section={sections["shop_categories"] ?? null} />
      <FeaturedProducts section={sections["featured_products"] ?? null} />
      <SplitCollections section={sections["split_collections"] ?? null} />
      <HeroSlider />
      <WhyTamouri section={sections["why_us"] ?? null} />
      <Testimonials section={sections["testimonials"] ?? null} />
    </>
  );
}

// Skeleton shown while BelowFold is streaming — keeps layout stable.
function BelowFoldSkeleton() {
  return (
    <div className="animate-pulse space-y-8 py-8">
      {/* Category cards row */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-6 bg-stone-100 rounded w-40 mx-auto mb-6" />
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-stone-100" />
          ))}
        </div>
      </div>
      {/* Featured products row */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-6 bg-stone-100 rounded w-48 mx-auto mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-stone-100 overflow-hidden">
              <div className="aspect-square bg-stone-50" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-stone-200 rounded w-2/3" />
                <div className="h-4 bg-stone-200 rounded" />
                <div className="h-8 bg-stone-200 rounded mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <TopBar />
      <Header />
      {/* Hero paints on first HTML flush — no DB required */}
      <Hero />
      {/* Everything below the fold streams in after getHomepageSections() resolves */}
      <Suspense fallback={<BelowFoldSkeleton />}>
        <BelowFold />
      </Suspense>
      <Footer />
    </main>
  );
}
