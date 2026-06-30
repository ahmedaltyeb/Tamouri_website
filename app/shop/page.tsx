import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import type { Product } from "@/lib/products";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShopContent from "@/components/ShopContent";

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

// ISR: revalidate products every 60 s — same interval as /api/products.
// Products are prefetched server-side so ShopContent renders without a
// loading skeleton on first visit.
export const revalidate = 60;

async function getProducts(): Promise<Product[]> {
  try {
    const rows = await prisma.product.findMany({
      where: {
        OR: [
          { categoryId: { not: null } },
          { categorySlug: { not: "" } },
        ],
      },
      orderBy: { createdAt: "asc" },
    });
    return rows as unknown as Product[];
  } catch {
    return [];
  }
}

export default async function ShopPage() {
  const initialProducts = await getProducts();

  return (
    <main className="min-h-screen">
      <TopBar />
      <Header />
      {/* Suspense is required because ShopContent calls useSearchParams() */}
      <Suspense>
        <ShopContent initialProducts={initialProducts} />
      </Suspense>
      <Footer />
    </main>
  );
}
