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

type MLText = { en: string; ar: string };

type ProductBody = {
  name: MLText;
  description: MLText;
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

function validateMLText(v: unknown, field: string): string[] {
  if (!v || typeof v !== "object" || Array.isArray(v)) {
    return [`${field} must be an object with en and ar keys`];
  }
  const o = v as Record<string, unknown>;
  const errors: string[] = [];
  if (!o.en || !String(o.en).trim()) errors.push(`${field}.en (English) is required`);
  if (!o.ar || !String(o.ar).trim()) errors.push(`${field}.ar (Arabic) is required`);
  return errors;
}

function validate(b: Partial<ProductBody>): string[] {
  const errors: string[] = [
    ...validateMLText(b.name, "name"),
    ...validateMLText(b.description, "description"),
  ];
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

export async function GET() {
  if (!(await requireAdmin())) return unauthorized();
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorized();
  const body = (await request.json()) as Partial<ProductBody>;
  const errors = validate(body);
  if (errors.length) return NextResponse.json({ errors }, { status: 422 });

  const name = body.name!;
  const description = body.description!;
  const images = body.images?.length ? body.images : body.image?.trim() ? [body.image.trim()] : [];
  const primaryImage = images[0] ?? "";

  const product = await prisma.product.create({
    data: {
      name: JSON.stringify({ en: name.en.trim(), ar: name.ar.trim() }),
      description: JSON.stringify({ en: description.en.trim(), ar: description.ar.trim() }),
      price: body.price!,
      originalPrice: body.originalPrice ?? null,
      category: body.category!.trim(),
      categorySlug: body.categorySlug!.trim(),
      image: primaryImage,
      images,
      badge: body.badge?.trim() || null,
      rating: body.rating ?? 0,
      reviews: body.reviews ?? 0,
      inStock: body.inStock ?? true,
      stock: body.stock ?? 0,
    },
  });
  return NextResponse.json(product, { status: 201 });
}
