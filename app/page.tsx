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

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryCards from "@/components/CategoryCards";
import FeaturedProducts from "@/components/FeaturedProducts";
import HeroSlider from "@/components/HeroSlider";
import WhyTamouri from "@/components/WhyTamouri";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <TopBar />
      <Header />
      <Hero />
      <CategoryCards />
      <FeaturedProducts />
      <HeroSlider />
      <WhyTamouri />
      <Testimonials />
      <Footer />
    </main>
  );
}
