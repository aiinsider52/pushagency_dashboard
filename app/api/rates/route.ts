import { NextResponse } from "next/server";

// n8n webhook (WF-18 Rates API) is the single source of truth for tariff rates.
// The dashboard never talks to Google directly — it proxies through n8n, which
// owns the Google Sheets OAuth credential.
const WEBHOOK = process.env.RATES_WEBHOOK || "https://pushagency.app.n8n.cloud/webhook/rates";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const r = await fetch(WEBHOOK, { cache: "no-store" });
    const data = await r.json().catch(() => []);
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const r = await fetch(WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const data = await r.json().catch(() => ({ ok: r.ok }));
    return NextResponse.json(data, { status: r.ok ? 200 : 502 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 502 });
  }
}
