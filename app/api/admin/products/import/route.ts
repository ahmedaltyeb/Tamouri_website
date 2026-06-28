import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

export interface RowError {
  row: number;
  field: string;
  message: string;
}

export interface ImportResult {
  total: number;
  valid: number;
  invalid: number;
  created: number;
  updated: number;
  skipped: number;
  errors: RowError[];
}

type RawRow = Record<string, string | number | boolean | undefined>;

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[\s_()\-]/g, "");
}

function normalizeRow(row: RawRow): RawRow {
  const out: RawRow = {};
  for (const [k, v] of Object.entries(row)) {
    out[normalizeKey(k)] = v;
  }
  return out;
}

function str(v: string | number | boolean | undefined): string {
  return v === undefined || v === null ? "" : String(v).trim();
}

function parseBoolean(v: string | number | boolean | undefined): boolean {
  if (typeof v === "boolean") return v;
  const s = str(v).toLowerCase();
  return !["false", "0", "no", "off", "disabled", "out of stock"].includes(s);
}

interface ValidatedData {
  sku: string | null;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  price: number;
  originalPrice: number | null;
  category: string;
  categorySlug: string;
  image: string;
  images: string[];
  badge: string | null;
  inStock: boolean;
  stock: number;
  rating: number;
  reviews: number;
}

function validateRow(
  raw: RawRow,
  rowIndex: number
): { valid: true; data: ValidatedData } | { valid: false; errors: RowError[] } {
  const errors: RowError[] = [];
  const r = normalizeRow(raw);

  // Multilingual name: prefer name_en/name_ar; fall back to legacy name column
  const nameEn = str(r["nameen"] ?? r["name"]);
  const nameAr = str(r["namear"] ?? r["name"]);

  // Multilingual description
  const descEn = str(r["descriptionen"] ?? r["description"]);
  const descAr = str(r["descriptionar"] ?? r["description"]);

  const priceStr = str(r["price"]);
  const category = str(r["category"]);
  const categorySlug = str(r["categoryslug"] ?? r["categoryslu"] ?? r["cat"]);
  const imageVal = str(r["image"] ?? r["primaryimage"] ?? r["imageurl"]);
  const imagesVal = str(r["images"] ?? r["allimages"] ?? r["imageurl"]);
  const originalPriceStr = str(r["originalprice"] ?? r["saleprice"]);
  const stockStr = str(r["stock"]);
  const ratingStr = str(r["rating"]);
  const reviewsStr = str(r["reviews"]);
  const skuVal = str(r["sku"]);
  const badgeVal = str(r["badge"]);
  const inStockVal = r["instock"] ?? r["available"];

  if (!nameEn) errors.push({ row: rowIndex, field: "name_en", message: "Name (EN) is required" });
  if (!nameAr) errors.push({ row: rowIndex, field: "name_ar", message: "Name (AR) is required — use same value as EN if no Arabic translation" });
  if (!descEn) errors.push({ row: rowIndex, field: "description_en", message: "Description (EN) is required" });
  if (!descAr) errors.push({ row: rowIndex, field: "description_ar", message: "Description (AR) is required" });
  if (!category) errors.push({ row: rowIndex, field: "category", message: "Category is required" });

  const price = parseFloat(priceStr);
  if (!priceStr || isNaN(price) || price <= 0)
    errors.push({ row: rowIndex, field: "price", message: "Price must be a positive number" });

  const hasImage = imageVal || imagesVal;
  if (!hasImage)
    errors.push({ row: rowIndex, field: "image", message: "At least one image URL is required" });

  let originalPrice: number | null = null;
  if (originalPriceStr) {
    originalPrice = parseFloat(originalPriceStr);
    if (isNaN(originalPrice) || originalPrice <= 0) {
      errors.push({ row: rowIndex, field: "originalPrice", message: "Original price must be positive" });
      originalPrice = null;
    }
  }

  let rating = 0;
  if (ratingStr) {
    rating = parseFloat(ratingStr);
    if (isNaN(rating) || rating < 0 || rating > 5) {
      errors.push({ row: rowIndex, field: "rating", message: "Rating must be between 0 and 5" });
      rating = 0;
    }
  }

  let stock = 0;
  if (stockStr) {
    stock = parseInt(stockStr, 10);
    if (isNaN(stock) || stock < 0) {
      errors.push({ row: rowIndex, field: "stock", message: "Stock must be a non-negative integer" });
      stock = 0;
    }
  }

  if (errors.length > 0) return { valid: false, errors };

  const imagesArr = imagesVal
    ? imagesVal.split("|").map((s) => s.trim()).filter(Boolean)
    : imageVal
    ? [imageVal]
    : [];
  const primaryImage = imagesArr[0] ?? "";

  const slug = categorySlug || category.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  return {
    valid: true,
    data: {
      sku: skuVal || null,
      name: { en: nameEn, ar: nameAr },
      description: { en: descEn, ar: descAr },
      price,
      originalPrice,
      category,
      categorySlug: slug,
      image: primaryImage,
      images: imagesArr,
      badge: badgeVal || null,
      inStock: parseBoolean(inStockVal),
      stock,
      rating,
      reviews: parseInt(reviewsStr, 10) || 0,
    },
  };
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorized();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Failed to parse form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const mode = (formData.get("mode") as string) || "create";
  const dryRun = formData.get("dryRun") === "true";

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".csv") && !fileName.endsWith(".xls")) {
    return NextResponse.json({ error: "Only .xlsx, .xls, and .csv files are supported" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let rows: RawRow[];
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    rows = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: "" });
  } catch {
    return NextResponse.json({ error: "Failed to parse file. Ensure it is a valid Excel or CSV file." }, { status: 400 });
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: "File is empty or has no data rows" }, { status: 400 });
  }

  if (rows.length > 5000) {
    return NextResponse.json({ error: "Maximum 5,000 rows per import" }, { status: 400 });
  }

  const result: ImportResult = {
    total: rows.length,
    valid: 0,
    invalid: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  const validRows: ValidatedData[] = [];

  rows.forEach((row, i) => {
    const res = validateRow(row, i + 2);
    if (res.valid) {
      result.valid++;
      validRows.push(res.data);
    } else {
      result.invalid++;
      result.errors.push(...res.errors);
    }
  });

  if (dryRun) return NextResponse.json(result);

  for (const data of validRows) {
    try {
      if (mode === "update") {
        // Match by SKU first, then by English name
        let existing = null;
        if (data.sku) {
          existing = await prisma.product.findUnique({ where: { sku: data.sku }, select: { id: true } });
        }
        if (!existing) {
          // JSON path filter: find by name.en
          const all = await prisma.product.findMany({ select: { id: true, name: true } });
          const match = all.find((p) => {
            try {
              const n = JSON.parse(p.name) as Record<string, string>;
              return n?.en?.toLowerCase() === data.name.en.toLowerCase();
            } catch {
              return p.name.toLowerCase() === data.name.en.toLowerCase();
            }
          });
          if (match) existing = match;
        }
        const dbData = {
          ...data,
          name: JSON.stringify(data.name),
          description: JSON.stringify(data.description),
        };
        if (existing) {
          await prisma.product.update({ where: { id: existing.id }, data: dbData });
          result.updated++;
        } else {
          await prisma.product.create({ data: dbData });
          result.created++;
        }
      } else {
        // create / skip — check for duplicate by SKU or English name
        let existing = null;
        if (data.sku) {
          existing = await prisma.product.findUnique({ where: { sku: data.sku }, select: { id: true } });
        }
        if (!existing) {
          const all = await prisma.product.findMany({ select: { id: true, name: true } });
          const match = all.find((p) => {
            try {
              const n = JSON.parse(p.name) as Record<string, string>;
              return n?.en?.toLowerCase() === data.name.en.toLowerCase();
            } catch {
              return p.name.toLowerCase() === data.name.en.toLowerCase();
            }
          });
          if (match) existing = match;
        }
        if (existing) {
          result.skipped++;
        } else {
          const dbData = {
            ...data,
            name: JSON.stringify(data.name),
            description: JSON.stringify(data.description),
          };
          await prisma.product.create({ data: dbData });
          result.created++;
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      result.errors.push({ row: -1, field: "database", message: `Failed to save "${data.name.en}": ${msg}` });
      result.invalid++;
      result.valid--;
    }
  }

  return NextResponse.json(result);
}
