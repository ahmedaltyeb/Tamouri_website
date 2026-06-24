import { NextResponse } from "next/server";
import { auth } from "@/auth";
import * as XLSX from "xlsx";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

const HEADERS = [
  "sku", "name_en", "name_ar", "description_en", "description_ar",
  "category", "categorySlug", "price", "originalPrice",
  "stock", "inStock", "image", "images", "badge", "rating", "reviews",
];

const SAMPLE_ROWS = [
  {
    sku: "PRD-001",
    name_en: "Organic Argan Oil",
    name_ar: "زيت أرغان عضوي",
    description_en: "Premium cold-pressed argan oil from Morocco. Perfect for hair and skin care.",
    description_ar: "زيت أرغان مضغوط على البارد من المغرب. مثالي للعناية بالشعر والبشرة.",
    category: "Hair Care",
    categorySlug: "hair-care",
    price: 89.99,
    originalPrice: 120.00,
    stock: 50,
    inStock: "Yes",
    image: "https://example.com/images/argan-oil.jpg",
    images: "https://example.com/images/argan-oil.jpg|https://example.com/images/argan-oil-2.jpg",
    badge: "Best Seller",
    rating: 4.8,
    reviews: 124,
  },
  {
    sku: "PRD-002",
    name_en: "Rose Water Toner",
    name_ar: "تونر ماء الورد",
    description_en: "Natural rose water facial toner with hyaluronic acid. Suitable for all skin types.",
    description_ar: "تونر وجه بماء الورد الطبيعي مع حمض الهيالورونيك. مناسب لجميع أنواع البشرة.",
    category: "Skin Care",
    categorySlug: "skin-care",
    price: 45.00,
    originalPrice: "",
    stock: 30,
    inStock: "Yes",
    image: "https://example.com/images/rose-toner.jpg",
    images: "https://example.com/images/rose-toner.jpg",
    badge: "New",
    rating: 4.5,
    reviews: 67,
  },
  {
    sku: "PRD-003",
    name_en: "Oud Wood Perfume",
    name_ar: "عطر عود",
    description_en: "Luxury Arabic oud perfume with notes of sandalwood and amber. Long-lasting fragrance.",
    description_ar: "عطر عود عربي فاخر بنفحات الصندل والعنبر. عطر يدوم طويلاً.",
    category: "Perfumes",
    categorySlug: "perfumes",
    price: 299.00,
    originalPrice: 350.00,
    stock: 15,
    inStock: "Yes",
    image: "https://example.com/images/oud-perfume.jpg",
    images: "",
    badge: "Limited Edition",
    rating: 5.0,
    reviews: 38,
  },
];

export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "xlsx";

  if (format === "csv") {
    const ws = XLSX.utils.json_to_sheet(SAMPLE_ROWS, { header: HEADERS });
    const csv = XLSX.utils.sheet_to_csv(ws);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="products-import-template.csv"',
      },
    });
  }

  const ws = XLSX.utils.json_to_sheet(SAMPLE_ROWS, { header: HEADERS });

  ws["!cols"] = [
    { wch: 12 }, { wch: 30 }, { wch: 30 }, { wch: 50 }, { wch: 50 },
    { wch: 18 }, { wch: 18 }, { wch: 10 }, { wch: 14 },
    { wch: 8 }, { wch: 10 }, { wch: 55 }, { wch: 80 }, { wch: 16 }, { wch: 8 }, { wch: 8 },
  ];

  const instructionsData = [
    { Field: "sku",             Required: "No",   Description: "Unique product identifier. Used to match existing products on update." },
    { Field: "name_en",         Required: "YES",  Description: "Product name in English." },
    { Field: "name_ar",         Required: "YES",  Description: "Product name in Arabic (العربية). Use same as English if no translation." },
    { Field: "description_en",  Required: "YES",  Description: "Full product description in English." },
    { Field: "description_ar",  Required: "YES",  Description: "Full product description in Arabic." },
    { Field: "category",        Required: "YES",  Description: "Category display name (e.g. Hair Care)." },
    { Field: "categorySlug",    Required: "No",   Description: "URL-safe slug (e.g. hair-care). Auto-generated from category if blank." },
    { Field: "price",           Required: "YES",  Description: "Current selling price. Must be a positive number." },
    { Field: "originalPrice",   Required: "No",   Description: "Original/crossed-out price. Leave blank if no sale." },
    { Field: "stock",           Required: "No",   Description: "Number of units in stock. Defaults to 0." },
    { Field: "inStock",         Required: "No",   Description: "Yes/No or true/false. Defaults to Yes." },
    { Field: "image",           Required: "YES*", Description: "Primary product image URL. *Required if images is blank." },
    { Field: "images",          Required: "No",   Description: "All image URLs separated by pipe | character." },
    { Field: "badge",           Required: "No",   Description: "Badge label (e.g. Best Seller, New, Sale, Limited Edition)." },
    { Field: "rating",          Required: "No",   Description: "Product rating 0–5. Defaults to 0." },
    { Field: "reviews",         Required: "No",   Description: "Number of reviews. Defaults to 0." },
  ];
  const wsInstructions = XLSX.utils.json_to_sheet(instructionsData);
  wsInstructions["!cols"] = [{ wch: 18 }, { wch: 10 }, { wch: 70 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Products Template");
  XLSX.utils.book_append_sheet(wb, wsInstructions, "Field Instructions");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="products-import-template.xlsx"',
    },
  });
}
