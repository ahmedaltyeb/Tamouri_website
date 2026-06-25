import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getSections,
  createSection,
  reorderSections,
  type CmsSectionType,
} from "@/lib/cms/sections";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

// GET /api/admin/cms/sections — list all sections (admin, all enabled states)
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sections = await getSections();
  return NextResponse.json(sections);
}

// POST /api/admin/cms/sections — create a new section
export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    type?: string;
    title?: string;
    data?: Record<string, unknown>;
    enabled?: boolean;
    sortOrder?: number;
  };

  try {
    body = await request.json() as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const VALID_TYPES = new Set([
    "hero", "products", "footer", "payment_methods", "banner", "custom",
  ]);

  if (!body.type || !VALID_TYPES.has(body.type)) {
    return NextResponse.json({ error: "Invalid or missing type" }, { status: 422 });
  }

  const section = await createSection({
    type: body.type as CmsSectionType,
    title: body.title,
    data: body.data,
    enabled: body.enabled,
    sortOrder: body.sortOrder,
  });

  return NextResponse.json(section, { status: 201 });
}

// PATCH /api/admin/cms/sections — bulk reorder
export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { orderedIds?: string[] };
  try {
    body = await request.json() as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.orderedIds)) {
    return NextResponse.json({ error: "orderedIds must be an array" }, { status: 422 });
  }

  await reorderSections(body.orderedIds);
  return NextResponse.json({ ok: true });
}
