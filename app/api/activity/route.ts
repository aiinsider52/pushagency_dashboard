import { NextResponse } from "next/server";
import { getActivity } from "@/lib/sheet";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getActivity(80);
  return NextResponse.json(data);
}
