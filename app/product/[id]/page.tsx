import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { products as staticProducts } from "@/lib/products";
import ProductPageClient from "@/components/ProductPageClient";

export function generateStaticParams() {
  return staticProducts.map((p) => ({ id: p.id }));
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      select: { name: true, description: true, image: true },
    });

    if (!product) return { title: "مربع الغربية للتمور" };

    return {
      title: `${product.name} — مربع الغربية للتمور`,
      description: product.description.slice(0, 160),
      openGraph: {
        title: product.name,
        description: product.description.slice(0, 160),
        images: [{ url: product.image, width: 800, height: 800, alt: product.name }],
        type: "website",
      },
    };
  } catch {
    return { title: "مربع الغربية للتمور" };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductPageClient id={id} />;
}
