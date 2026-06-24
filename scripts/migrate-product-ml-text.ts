/**
 * Safe data migration: converts Product.name and Product.description
 * from plain String → Json { en, ar }.
 *
 * Run AFTER applying the Prisma schema migration:
 *   npx prisma migrate dev --name add-product-ml-text
 *   npx tsx scripts/migrate-product-ml-text.ts
 *
 * Rollback:
 *   The script writes { en: original, ar: original } so NO data is lost.
 *   To rollback the schema, run the reverse migration and restore String fields.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, description: true },
  });

  console.log(`Found ${products.length} products to migrate.`);

  let migrated = 0;
  let skipped = 0;

  for (const p of products) {
    const name = p.name as unknown;
    const description = p.description as unknown;

    // Already migrated — has { en, ar } shape
    const nameAlreadyMigrated =
      name &&
      typeof name === "object" &&
      !Array.isArray(name) &&
      "en" in (name as object) &&
      "ar" in (name as object);

    const descAlreadyMigrated =
      description &&
      typeof description === "object" &&
      !Array.isArray(description) &&
      "en" in (description as object) &&
      "ar" in (description as object);

    if (nameAlreadyMigrated && descAlreadyMigrated) {
      skipped++;
      continue;
    }

    // Convert: existing value → en, same value → ar (safe fallback)
    const newName = nameAlreadyMigrated
      ? name
      : { en: String(name ?? ""), ar: String(name ?? "") };

    const newDescription = descAlreadyMigrated
      ? description
      : { en: String(description ?? ""), ar: String(description ?? "") };

    await prisma.product.update({
      where: { id: p.id },
      data: { name: newName, description: newDescription },
    });

    migrated++;
    process.stdout.write(`\r  Migrated ${migrated}/${products.length - skipped}...`);
  }

  console.log(`\nDone. Migrated: ${migrated}, Already done: ${skipped}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
