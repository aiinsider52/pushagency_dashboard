import { NextResponse } from "next/server";
import { getPipelineSummary } from "@/lib/clickup";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getPipelineSummary();
  return NextResponse.json(data);
}
