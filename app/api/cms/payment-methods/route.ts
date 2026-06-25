import { NextResponse } from "next/server";
import { getPaymentMethods } from "@/lib/site-settings";

export async function GET() {
  const methods = await getPaymentMethods();
  return NextResponse.json(methods);
}
