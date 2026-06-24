import { prisma } from "@/lib/prisma";
import { parseMLText } from "@/lib/products";
import ProductsClient from "./_components/ProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const raw = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, sku: true, name: true, description: true,
      price: true, originalPrice: true, category: true,
      categorySlug: true, image: true, badge: true,
      rating: true, reviews: true, inStock: true,
      stock: true, createdAt: true,
    },
  });

  // Normalise Json fields so the client component gets plain strings
  const products = raw.map((p) => ({
    ...p,
    name: parseMLText(p.name),
    description: parseMLText(p.description),
  }));

  const categories = [...new Set(products.map((p) => p.categorySlug))].sort();

  return <ProductsClient products={products} categories={categories} />;
}
