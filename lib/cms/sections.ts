import { prisma } from "@/lib/prisma";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CmsSectionType =
  | "hero"
  | "products"
  | "footer"
  | "payment_methods"
  | "banner"
  | "custom";

export interface CmsSectionData {
  id: string;
  type: CmsSectionType;
  title: string | null;
  data: Record<string, unknown>;  // parsed from JSON string
  enabled: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// ── In-memory cache (same pattern as site-settings.ts) ────────────────────────

let cache: { data: CmsSectionData[]; at: number } | null = null;
const TTL = 60_000; // 60 s

export function invalidateSectionsCache() {
  cache = null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseData(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}

function toSection(row: {
  id: string;
  type: string;
  title: string | null;
  data: string;
  enabled: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}): CmsSectionData {
  return {
    id: row.id,
    type: row.type as CmsSectionType,
    title: row.title,
    data: parseData(row.data),
    enabled: row.enabled,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/** All sections, sorted by sortOrder. Uses 60-second in-memory cache. */
export async function getSections(): Promise<CmsSectionData[]> {
  if (cache && Date.now() - cache.at < TTL) return cache.data;

  try {
    const rows = await prisma.cmsSection.findMany({
      orderBy: { sortOrder: "asc" },
    });
    const data = rows.map(toSection);
    cache = { data, at: Date.now() };
    return data;
  } catch {
    return [];
  }
}

/** All ENABLED sections for the storefront. */
export async function getEnabledSections(): Promise<CmsSectionData[]> {
  const all = await getSections();
  return all.filter((s) => s.enabled);
}

/** First section matching the given type (enabled or not — caller decides). */
export async function getSectionByType(
  type: CmsSectionType,
  enabledOnly = false
): Promise<CmsSectionData | null> {
  const all = await getSections();
  return (
    all.find((s) => s.type === type && (!enabledOnly || s.enabled)) ?? null
  );
}

/** All sections of a given type. */
export async function getSectionsByType(
  type: CmsSectionType,
  enabledOnly = false
): Promise<CmsSectionData[]> {
  const all = await getSections();
  return all.filter((s) => s.type === type && (!enabledOnly || s.enabled));
}

// ── Mutations (admin only — always invalidate cache) ──────────────────────────

export async function createSection(input: {
  type: CmsSectionType;
  title?: string;
  data?: Record<string, unknown>;
  enabled?: boolean;
  sortOrder?: number;
}): Promise<CmsSectionData> {
  const count = await prisma.cmsSection.count({ where: { type: input.type } });
  const row = await prisma.cmsSection.create({
    data: {
      type: input.type,
      title: input.title ?? null,
      data: JSON.stringify(input.data ?? {}),
      enabled: input.enabled ?? true,
      sortOrder: input.sortOrder ?? count,
    },
  });
  invalidateSectionsCache();
  return toSection(row);
}

export async function updateSection(
  id: string,
  input: Partial<{
    type: CmsSectionType;
    title: string | null;
    data: Record<string, unknown>;
    enabled: boolean;
    sortOrder: number;
  }>
): Promise<CmsSectionData> {
  const updateData: Record<string, unknown> = {};
  if ("type" in input)      updateData.type      = input.type;
  if ("title" in input)     updateData.title     = input.title;
  if ("enabled" in input)   updateData.enabled   = input.enabled;
  if ("sortOrder" in input) updateData.sortOrder = input.sortOrder;
  if ("data" in input)      updateData.data      = JSON.stringify(input.data);

  const row = await prisma.cmsSection.update({ where: { id }, data: updateData });
  invalidateSectionsCache();
  return toSection(row);
}

export async function deleteSection(id: string): Promise<void> {
  await prisma.cmsSection.delete({ where: { id } });
  invalidateSectionsCache();
}

/**
 * Reorder sections by supplying an ordered array of ids.
 * Each id gets its sortOrder set to its index position.
 */
export async function reorderSections(orderedIds: string[]): Promise<void> {
  await prisma.$transaction(
    orderedIds.map((id, i) =>
      prisma.cmsSection.update({ where: { id }, data: { sortOrder: i } })
    )
  );
  invalidateSectionsCache();
}
