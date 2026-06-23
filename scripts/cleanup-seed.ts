/**
 * Deletes the 11 old Arabic-named seed products that have no categoryId
 * (pre-date the catalog import). Safe — skips any product referenced by an order.
 *
 * Usage: npx tsx scripts/cleanup-seed.ts [--execute]
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const EXECUTE = process.argv.includes("--execute");

async function main() {
  // Arabic-named products have no categoryId (they predate the import)
  const candidates = await prisma.product.findMany({
    where: { categoryId: null },
    select: { id: true, name: true, categorySlug: true },
  });

  if (candidates.length === 0) {
    console.log("✅  No old seed products found — nothing to clean up.");
    return;
  }

  // Check which ones have order references
  const referencedIds = (
    await prisma.orderItem.findMany({
      where: { productId: { in: candidates.map((p) => p.id) } },
      select: { productId: true },
      distinct: ["productId"],
    })
  ).map((r) => r.productId);

  const toDelete = candidates.filter((p) => !referencedIds.includes(p.id));
  const skipped = candidates.filter((p) => referencedIds.includes(p.id));

  console.log(`\nFound ${candidates.length} old seed products (no categoryId):`);
  toDelete.forEach((p) => console.log(`  🗑   ${p.name}`));
  if (skipped.length)
    skipped.forEach((p) => console.log(`  ⚠️   SKIP (has orders): ${p.name}`));

  if (!EXECUTE) {
    console.log(`\n👆  Dry run — pass --execute to delete ${toDelete.length} products.\n`);
    return;
  }

  const result = await prisma.product.deleteMany({
    where: { id: { in: toDelete.map((p) => p.id) } },
  });
  console.log(`\n✅  Deleted ${result.count} old seed products.\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
