import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ProductBody = {
  name: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  category: string;
  categorySlug: string;
  image: string;
  badge?: string | null;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
};

function validate(b: Partial<ProductBody>): string[] {
  const errors: string[] = [];
  if (!b.name?.trim()) errors.push("Name is required");
  if (!b.description?.trim()) errors.push("Description is required");
  if (typeof b.price !== "number" || b.price <= 0) errors.push("Price must be a positive number");
  if (!b.categorySlug?.trim()) errors.push("Category is required");
  if (!b.category?.trim()) errors.push("Category name is required");
  if (!b.image?.trim()) errors.push("Image URL is required");
  if (
    b.originalPrice !== undefined &&
    b.originalPrice !== null &&
    (typeof b.originalPrice !== "number" || b.originalPrice <= 0)
  ) {
    errors.push("Original price must be a positive number");
  }
  if (b.rating !== undefined && (typeof b.rating !== "number" || b.rating < 0 || b.rating > 5)) {
    errors.push("Rating must be between 0 and 5");
  }
  return errors;
}

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<ProductBody>;
  const errors = validate(body);
  if (errors.length) return NextResponse.json({ errors }, { status: 422 });

  const product = await prisma.product.create({
    data: {
      name: body.name!.trim(),
      description: body.description!.trim(),
      price: body.price!,
      originalPrice: body.originalPrice ?? null,
      category: body.category!.trim(),
      categorySlug: body.categorySlug!.trim(),
      image: body.image!.trim(),
      badge: body.badge?.trim() || null,
      rating: body.rating ?? 0,
      reviews: body.reviews ?? 0,
      inStock: body.inStock ?? true,
    },
  });
  return NextResponse.json(product, { status: 201 });
}
