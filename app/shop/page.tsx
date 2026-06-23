import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "تسوق الآن — تمور وقهوة وزعفران وهدايا فاخرة",
  description:
    "تصفح أكثر من ١١ منتجاً إماراتياً أصيلاً: تمر مجدول، قهوة عربية، زعفران، شاي كرك، طقم ضيافة وبوكسات هدايا. توصيل لجميع الإمارات. Shop authentic UAE products — dates, Arabic coffee, saffron, tea & luxury gift sets.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://tamouri.onrender.com"}/shop`,
  },
  openGraph: {
    title: "تسوق — مربع الغربية للتمور",
    description: "تمور فاخرة وقهوة عربية وزعفران وهدايا إماراتية أصيلة بتوصيل لجميع الإمارات.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://tamouri.onrender.com"}/shop`,
    type: "website",
  },
};

import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShopContent from "@/components/ShopContent";

export default function ShopPage() {
  return (
    <main className="min-h-screen">
      <TopBar />
      <Header />
      <Suspense>
        <ShopContent />
      </Suspense>
      <Footer />
    </main>
  );
}
