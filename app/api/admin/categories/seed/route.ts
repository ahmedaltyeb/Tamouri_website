import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

// Default category data matching the legacy hardcoded list in lib/products.ts
const CATEGORY_DEFAULTS: Array<{
  slug: string;
  nameEn: string;
  nameAr: string;
  image: string;
  sortOrder: number;
}> = [
  { slug: "dates",            nameEn: "Dates",                nameAr: "التمر",               image: "https://i.ibb.co/WvwTpK27/dates.jpg",                                                        sortOrder: 0 },
  { slug: "arabic-coffee",    nameEn: "Arabic Coffee",        nameAr: "القهوة العربية",       image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&q=80",                   sortOrder: 1 },
  { slug: "specialty-coffee", nameEn: "Specialty Coffee",     nameAr: "قهوة مختصة",           image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=80",                   sortOrder: 2 },
  { slug: "tea",              nameEn: "Tea",                  nameAr: "الشاي",               image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&q=80",                       sortOrder: 3 },
  { slug: "tools",            nameEn: "Coffee & Tea Tools",   nameAr: "أدوات القهوة والشاي", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=80",                   sortOrder: 4 },
  { slug: "travel-tools",     nameEn: "Travel & Outdoor",     nameAr: "أدوات السفر والتنقل", image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=300&q=80",                   sortOrder: 5 },
  { slug: "sweets",           nameEn: "Sweets & Cookies",     nameAr: "حلويات وبسكويت",       image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&q=80",                      sortOrder: 6 },
];

// POST /api/admin/categories/seed — one-time migration to populate nameEn/nameAr/image
export async function POST() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  for (const defaults of CATEGORY_DEFAULTS) {
    const existing = await prisma.category.findUnique({ where: { slug: defaults.slug } });

    if (existing) {
      await prisma.category.update({
        where: { slug: defaults.slug },
        data: {
          nameEn:    existing.nameEn    ?? defaults.nameEn,
          nameAr:    existing.nameAr    ?? defaults.nameAr,
          image:     existing.image     ?? defaults.image,
          sortOrder: existing.sortOrder !== 0 ? existing.sortOrder : defaults.sortOrder,
        },
      });
      results.push(`updated: ${defaults.slug}`);
    } else {
      results.push(`skipped (not found): ${defaults.slug}`);
    }
  }

  return NextResponse.json({ ok: true, results });
}
