import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseMLText } from "@/lib/products";
import ProductForm from "../../_components/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  const name = parseMLText(product.name);
  const description = parseMLText(product.description);

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6">
        <Link href="/admin/products" className="text-stone-400 hover:text-stone-600 transition-colors">
          Products
        </Link>
        <span className="text-stone-300">/</span>
        <span className="text-stone-700 font-medium truncate max-w-[200px]">{name.en}</span>
        <span className="text-stone-300">/</span>
        <span className="text-stone-700 font-medium">Edit</span>
      </nav>

      <h1 className="text-2xl font-bold text-stone-900 mb-6">Edit Product</h1>

      <ProductForm
        mode="edit"
        product={{
          id: product.id,
          name,
          description,
          price: product.price,
          originalPrice: product.originalPrice ?? undefined,
          category: product.category,
          categorySlug: product.categorySlug,
          image: product.image,
          badge: product.badge ?? undefined,
          rating: product.rating,
          reviews: product.reviews,
          inStock: product.inStock,
          stock: product.stock,
        }}
      />
    </div>
  );
}
