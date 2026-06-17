import { NextResponse } from "next/server";
import { getFinanceSummary } from "@/lib/clickup";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getFinanceSummary();
  return NextResponse.json(data);
}
