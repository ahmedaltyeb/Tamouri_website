import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateSection, deleteSection, type CmsSectionType } from "@/lib/cms/sections";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const input: Parameters<typeof updateSection>[1] = {};
  if ("type" in body)      input.type      = body.type as CmsSectionType;
  if ("title" in body)     input.title     = (body.title as string) ?? null;
  if ("data" in body)      input.data      = body.data as Record<string, unknown>;
  if ("enabled" in body)   input.enabled   = Boolean(body.enabled);
  if ("sortOrder" in body) input.sortOrder = Number(body.sortOrder);

  try {
    const section = await updateSection(id, input);
    return NextResponse.json(section);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteSection(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
