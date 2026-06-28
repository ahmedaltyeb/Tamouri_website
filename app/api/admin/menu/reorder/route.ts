import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { invalidateCmsCache } from "@/lib/site-settings";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

// PATCH /api/admin/menu/reorder
// Body: { ids: string[] }  — ordered array of all menu item IDs
export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { ids?: string[] };
  try {
    body = await request.json() as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.ids)) {
    return NextResponse.json({ error: "ids must be an array" }, { status: 422 });
  }

  await Promise.all(
    body.ids.map((id, index) =>
      prisma.menuItem.update({ where: { id }, data: { sortOrder: index } })
    )
  );

  invalidateCmsCache();
  return NextResponse.json({ ok: true });
}
