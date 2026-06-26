import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

// Map categorySlug → Arabic category name
const CATEGORY_AR: Record<string, string> = {
  "dates": "التمر",
  "arabic-coffee": "القهوة العربية",
  "specialty-coffee": "القهوة المختصة",
  "tea": "الشاي",
  "tools": "أدوات القهوة والشاي",
  "travel-tools": "أدوات السفر والرحلات",
  "gift-boxes": "صناديق الهدايا",
  "saffron": "الزعفران",
  "hospitality": "مستلزمات الضيافة",
  "sweets": "الحلويات",
};

function parseML(val: unknown): { en: string; ar: string } {
  if (!val) return { en: "", ar: "" };
  if (typeof val === "string") {
    try {
      const p = JSON.parse(val);
      if (p && typeof p === "object" && ("en" in p || "ar" in p)) {
        return { en: String(p.en ?? ""), ar: String(p.ar ?? "") };
      }
    } catch {}
    return { en: val, ar: "" };
  }
  if (typeof val === "object" && val !== null) {
    const o = val as Record<string, unknown>;
    return { en: String(o.en ?? ""), ar: String(o.ar ?? "") };
  }
  return { en: "", ar: "" };
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    orderBy: [{ categorySlug: "asc" }, { createdAt: "asc" }],
    select: {
      id: true, sku: true, name: true, description: true,
      category: true, categorySlug: true,
      price: true, originalPrice: true, stock: true,
      inStock: true, image: true, badge: true,
      rating: true, reviews: true,
    },
  });

  const rows = products.map((p) => {
    const name = parseML(p.name);
    const desc = parseML(p.description);
    const categoryAr = CATEGORY_AR[p.categorySlug] ?? "";

    return {
      id: p.id,
      sku: p.sku ?? "",
      name_en: name.en || name.ar,          // if only Arabic stored, put it in EN column too
      name_ar: name.ar || name.en,          // if no Arabic yet, pre-fill with English (to be translated)
      description_en: desc.en || desc.ar || "",
      description_ar: desc.ar || "",
      category: p.category,
      category_ar: categoryAr,
      categorySlug: p.categorySlug,
      price: p.price,
      originalPrice: p.originalPrice ?? "",
      stock: p.stock,
      inStock: p.inStock ? "Yes" : "No",
      badge: p.badge ?? "",
      rating: p.rating,
      reviews: p.reviews,
      image: p.image ?? "",
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);

  // Column widths for readability
  ws["!cols"] = [
    { wch: 30 }, // id
    { wch: 12 }, // sku
    { wch: 45 }, // name_en
    { wch: 45 }, // name_ar
    { wch: 50 }, // description_en
    { wch: 50 }, // description_ar
    { wch: 20 }, // category
    { wch: 20 }, // category_ar
    { wch: 16 }, // categorySlug
    { wch: 10 }, // price
    { wch: 13 }, // originalPrice
    { wch: 8 },  // stock
    { wch: 8 },  // inStock
    { wch: 15 }, // badge
    { wch: 8 },  // rating
    { wch: 8 },  // reviews
    { wch: 50 }, // image
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Products");

  // Instructions sheet
  const instructions = XLSX.utils.aoa_to_sheet([
    ["Tamouri Product Translation Sheet"],
    [""],
    ["Instructions:"],
    ["1. Fill in the 'name_ar' column with the Arabic translation for each product"],
    ["2. Optionally fill 'description_ar' with Arabic descriptions"],
    ["3. Do NOT change the 'id' or 'categorySlug' columns — these are used for matching"],
    ["4. Save the file and go to Admin → Products → Import"],
    ["5. Select mode: Update Existing, then upload this file"],
    [""],
    ["Tips:"],
    ["- Products where name_ar = name_en still need translation"],
    ["- You can also click 'Apply Arabic Translations' to apply pre-built translations in one click"],
  ]);
  XLSX.utils.book_append_sheet(wb, instructions, "Instructions");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="tamouri-product-translations-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
