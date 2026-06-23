import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

type ProductBody = {
  name: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  category: string;
  categorySlug: string;
  image: string;
  images?: string[];
  badge?: string | null;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  stock?: number;
};

function validate(b: Partial<ProductBody>): string[] {
  const errors: string[] = [];
  if (!b.name?.trim()) errors.push("Name is required");
  if (!b.description?.trim()) errors.push("Description is required");
  if (typeof b.price !== "number" || b.price <= 0) errors.push("Price must be a positive number");
  if (!b.categorySlug?.trim()) errors.push("Category is required");
  if (!b.category?.trim()) errors.push("Category name is required");
  const hasImage = (b.images && b.images.length > 0) || b.image?.trim();
  if (!hasImage) errors.push("At least one product image is required");
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) return unauthorized();

  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const body = (await request.json()) as Partial<ProductBody>;
  const errors = validate(body);
  if (errors.length) return NextResponse.json({ errors }, { status: 422 });

  const images = body.images?.length ? body.images : body.image?.trim() ? [body.image.trim()] : [];
  const primaryImage = images[0] ?? existing.image;

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: body.name!.trim(),
      description: body.description!.trim(),
      price: body.price!,
      originalPrice: body.originalPrice ?? null,
      category: body.category!.trim(),
      categorySlug: body.categorySlug!.trim(),
      image: primaryImage,
      images,
      badge: body.badge?.trim() || null,
      rating: body.rating ?? existing.rating,
      reviews: body.reviews ?? existing.reviews,
      inStock: body.inStock ?? existing.inStock,
      stock: body.stock ?? existing.stock,
    },
  });
  return NextResponse.json(product);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) return unauthorized();

  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
