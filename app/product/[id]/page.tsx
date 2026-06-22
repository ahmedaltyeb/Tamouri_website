import { products } from "@/lib/products";
import ProductPageClient from "@/components/ProductPageClient";

// Tell Next.js which product IDs to pre-render at build time
export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductPageClient id={id} />;
}
