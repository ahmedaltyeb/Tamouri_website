import { NextResponse } from "next/server";
import { getEnabledSections, getSectionsByType, type CmsSectionType } from "@/lib/cms/sections";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as CmsSectionType | null;

  const sections = type
    ? await getSectionsByType(type, true)
    : await getEnabledSections();

  return NextResponse.json(sections);
}
