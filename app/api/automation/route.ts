import { NextResponse } from "next/server";
import { getAutomationSummary } from "@/lib/n8n";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getAutomationSummary();
  return NextResponse.json(data);
}
