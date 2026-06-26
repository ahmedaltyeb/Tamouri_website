import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export async function GET() {
  const sections = await prisma.homepageSection.findMany({ where: { active: true } });
  // Return as a key-indexed object for easy lookup
  const map = Object.fromEntries(sections.map((s) => [s.key, s]));
  return NextResponse.json(map);
}
