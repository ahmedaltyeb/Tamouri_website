/**
 * Import script — reads marbea_catalog.json and upserts into DB.
 *
 * Usage:
 *   DRY_RUN=true  npx tsx scripts/import-store.ts        (preview only, default)
 *   DRY_RUN=false npx tsx scripts/import-store.ts        (write to DB)
 *   npx tsx scripts/import-store.ts --execute            (same as DRY_RUN=false)
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const EXECUTE =
  process.argv.includes("--execute") || process.env.DRY_RUN === "false";
const DRY_RUN = !EXECUTE;

// ─── Types ────────────────────────────────────────────────────────────────────

interface CatalogProduct {
  name: string;
  price_from: number;
  price_to: number;
  on_sale: boolean;
  original_price?: number;
  variants: string;
  url: string;
}

interface CatalogCategory {
  name: string;
  url: string;
  total_products: number | null;
  products: CatalogProduct[];
}

interface Catalog {
  store_info: {
    name: string;
    url: string;
    description: string;
    location: string;
    phone: string;
    whatsapp: string[];
    email: string;
    working_hours: string;
    currency: string;
  };
  categories: CatalogCategory[];
}

// ─── Category metadata ────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { slug: string; image: string }> = {
  "Dates": {
    slug: "dates",
    image: "https://images.unsplash.com/photo-1559628233-100c798642d6?w=600&q=80",
  },
  "Arabic Coffee": {
    slug: "arabic-coffee",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80",
  },
  "Specialty Coffee": {
    slug: "specialty-coffee",
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80",
  },
  "Tea": {
    slug: "tea",
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80",
  },
  "Coffee And Tea Tools": {
    slug: "tools",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
  },
  "Travel Tools": {
    slug: "travel-tools",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80",
  },
  "Candies / Sweets": {
    slug: "sweets",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80",
  },
  "Gift Boxes and Offers": {
    slug: "gift-boxes",
    image: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=600&q=80",
  },
  "Nuts":        { slug: "nuts",        image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&q=80" },
  "Cardamom":    { slug: "cardamom",    image: "https://images.unsplash.com/photo-1615485500834-bc10199bc727?w=600&q=80" },
  "Tahini":      { slug: "tahini",      image: "https://images.unsplash.com/photo-1595587870672-c79b47875c6d?w=600&q=80" },
  "Honey":       { slug: "honey",       image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80" },
  "Maamoul":     { slug: "maamoul",     image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=600&q=80" },
  "Olive Oil":   { slug: "olive-oil",   image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80" },
  "Rice":        { slug: "rice",        image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=600&q=80" },
  "Saffron":     { slug: "saffron",     image: "https://images.unsplash.com/photo-1615485500834-bc10199bc727?w=600&q=80" },
  "Spices":      { slug: "spices",      image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80" },
  "Sesame Oil":  { slug: "sesame-oil",  image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80" },
  "Coffee and Dates Wholesale": { slug: "wholesale", image: "https://images.unsplash.com/photo-1559628233-100c798642d6?w=600&q=80" },
  "Herbal Water": { slug: "herbal-water", image: "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=600&q=80" },
  "Various Products": { slug: "various", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return CATEGORY_META[name]?.slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function categoryImage(name: string): string {
  return CATEGORY_META[name]?.image ?? "https://images.unsplash.com/photo-1559628233-100c798642d6?w=600&q=80";
}

function buildDescription(p: CatalogProduct, catName: string): string {
  const variantNote = p.variants?.trim() ? ` Available in: ${p.variants.trim()}.` : "";
  const saleNote = p.on_sale ? " Currently on special offer." : "";
  return `${p.name} — premium ${catName.toLowerCase()} from Marbea Al Gharbeya Dates.${variantNote}${saleNote}`;
}

function isValidProduct(p: CatalogProduct): boolean {
  return (
    typeof p.name === "string" &&
    p.name.trim().length > 0 &&
    typeof p.price_from === "number" &&
    p.price_from > 0 &&
    typeof p.price_to === "number" &&
    p.price_to >= p.price_from
  );
}

function log(msg: string) {
  console.log(msg);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Locate the catalog file
  const catalogPath = path.resolve(
    __dirname,
    "../marbea_catalog.json"
  );

  if (!fs.existsSync(catalogPath)) {
    console.error(`\n❌  Catalog not found at: ${catalogPath}`);
    console.error("    Make sure marbea_catalog.json is in the project root.\n");
    process.exit(1);
  }

  const catalog: Catalog = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));

  log("\n" + "═".repeat(60));
  log(DRY_RUN
    ? "  🔍  DRY RUN  —  no DB writes  (pass --execute to write)"
    : "  ⚡  EXECUTE  —  writing to database");
  log("═".repeat(60) + "\n");

  // ── Collect validated products from catalog ──
  type PendingProduct = {
    catName: string;
    data: CatalogProduct;
    action: "CREATE" | "UPDATE";
    existingId?: string;
  };

  const pendingProducts: PendingProduct[] = [];

  // Existing product lookup: {name}_{categorySlug} → id
  const existing = await prisma.product.findMany({
    select: { id: true, name: true, categorySlug: true },
  });
  const existingMap = new Map(existing.map((p) => [`${p.name}__${p.categorySlug}`, p.id]));

  let skipped = 0;

  for (const cat of catalog.categories) {
    for (const p of cat.products) {
      if (!isValidProduct(p)) {
        skipped++;
        log(`  ⚠️   SKIP  [invalid]  ${String(p.name ?? "").slice(0, 50)}`);
        continue;
      }
      const slug = slugify(cat.name);
      const key = `${p.name.trim()}__${slug}`;
      const existingId = existingMap.get(key);
      pendingProducts.push({
        catName: cat.name,
        data: p,
        action: existingId ? "UPDATE" : "CREATE",
        existingId,
      });
    }
  }

  const creates = pendingProducts.filter((x) => x.action === "CREATE");
  const updates = pendingProducts.filter((x) => x.action === "UPDATE");

  // ── Store settings preview ──
  log("📋  STORE SETTINGS");
  log(`    name          : ${catalog.store_info.name}`);
  log(`    location      : ${catalog.store_info.location}`);
  log(`    phone         : ${catalog.store_info.phone}`);
  log(`    email         : ${catalog.store_info.email}`);
  log(`    working hours : ${catalog.store_info.working_hours}`);
  log(`    currency      : ${catalog.store_info.currency}`);
  log("");

  // ── Categories preview ──
  const catsWithProducts = catalog.categories.filter((c) => c.products.length > 0);
  const catsEmpty = catalog.categories.filter((c) => c.products.length === 0);

  log(`📁  CATEGORIES  (${catalog.categories.length} total)`);
  log(`    With products : ${catsWithProducts.length}`);
  log(`    Empty (saved) : ${catsEmpty.length}`);
  log("");

  // ── Products preview grouped by category ──
  log(`📦  PRODUCTS  (${pendingProducts.length} total | ${creates.length} CREATE | ${updates.length} UPDATE | ${skipped} SKIP)`);
  log("");

  const byCat: Record<string, PendingProduct[]> = {};
  for (const item of pendingProducts) {
    (byCat[item.catName] ??= []).push(item);
  }

  for (const [catName, items] of Object.entries(byCat)) {
    log(`  📁  ${catName}  (${items.length})`);
    for (const item of items) {
      const p = item.data;
      const icon = item.action === "CREATE" ? "+" : "~";
      const priceStr = p.price_from === p.price_to
        ? `${p.price_from} AED`
        : `${p.price_from}–${p.price_to} AED`;
      const saleFlag = p.on_sale ? "  [SALE]" : "";
      const variantFlag = p.variants?.trim() ? `  [${p.variants.trim().slice(0, 30)}]` : "";
      log(`    ${icon} [${item.action}]  ${p.name.slice(0, 52).padEnd(52)}  ${priceStr}${saleFlag}${variantFlag}`);
    }
    log("");
  }

  log("─".repeat(60));
  log(`  Categories  : ${catalog.categories.length}`);
  log(`  CREATE      : ${creates.length}`);
  log(`  UPDATE      : ${updates.length}`);
  log(`  SKIP        : ${skipped}`);
  log("─".repeat(60) + "\n");

  if (DRY_RUN) {
    log("👆  Dry run complete — pass --execute to write to the database.\n");
    return;
  }

  // ════════════════════════════════════════════════════
  //  EXECUTE
  // ════════════════════════════════════════════════════

  // 1. Upsert StoreSettings (singleton)
  const existingSettings = await prisma.storeSettings.findFirst();
  const settingsData = {
    name: catalog.store_info.name.trim(),
    description: catalog.store_info.description?.trim() ?? null,
    location: catalog.store_info.location?.trim() ?? null,
    phone: catalog.store_info.phone?.trim() ?? null,
    whatsapp: (catalog.store_info.whatsapp ?? []).join(","),
    email: catalog.store_info.email?.trim() ?? null,
    workingHours: catalog.store_info.working_hours?.trim() ?? null,
    currency: catalog.store_info.currency?.trim() ?? "AED",
    websiteUrl: catalog.store_info.url?.trim() ?? null,
  };
  if (existingSettings) {
    await prisma.storeSettings.update({ where: { id: existingSettings.id }, data: settingsData });
    log("✅  StoreSettings updated");
  } else {
    await prisma.storeSettings.create({ data: settingsData });
    log("✅  StoreSettings created");
  }

  // 2. Upsert all categories
  const categoryIdMap = new Map<string, string>(); // catName → category.id

  for (const cat of catalog.categories) {
    const slug = slugify(cat.name);
    const upserted = await prisma.category.upsert({
      where: { slug },
      create: {
        name: cat.name.trim(),
        slug,
        url: cat.url?.trim() ?? null,
        totalProducts: cat.products.length,
      },
      update: {
        name: cat.name.trim(),
        url: cat.url?.trim() ?? null,
        totalProducts: cat.products.length,
      },
    });
    categoryIdMap.set(cat.name, upserted.id);
  }
  log(`✅  Categories upserted: ${catalog.categories.length}`);

  // 3. Upsert products
  let created = 0;
  let updated = 0;

  for (const item of pendingProducts) {
    const p = item.data;
    const catId = categoryIdMap.get(item.catName)!;
    const slug = slugify(item.catName);
    const image = categoryImage(item.catName);

    const productData = {
      name: p.name.trim(),
      description: buildDescription(p, item.catName),
      price: p.price_from,
      originalPrice: p.on_sale && p.original_price ? p.original_price : null,
      category: item.catName,
      categorySlug: slug,
      image,
      badge: p.on_sale ? "خصم" : null,
      inStock: true,
      stock: 50,
      // Catalog-specific fields
      priceFrom: p.price_from,
      priceTo: p.price_to,
      currency: "AED",
      variants: p.variants?.trim() || null,
      productUrl: p.url?.trim() || null,
      categoryId: catId,
    };

    if (item.action === "CREATE") {
      await prisma.product.create({ data: productData });
      created++;
    } else {
      await prisma.product.update({
        where: { id: item.existingId! },
        data: productData,
      });
      updated++;
    }
  }

  log(`✅  Products created : ${created}`);
  log(`✅  Products updated : ${updated}`);
  log(`⚠️   Products skipped : ${skipped}`);
  log("\n🎉  Import complete!\n");

  // 4. Update category totalProducts counts from actual DB
  for (const [catName, catId] of categoryIdMap) {
    const count = await prisma.product.count({ where: { categoryId: catId } });
    await prisma.category.update({ where: { id: catId }, data: { totalProducts: count } });
  }
  log("✅  Category counts refreshed from DB\n");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
