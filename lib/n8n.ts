import { Execution, AutomationSummary, WorkflowStat } from "./types";
import { wfLabel } from "./workflows";
import { mockAutomation } from "./mock";

// The n8n Cloud trial does not expose the public REST API (/api/v1/* → 404),
// but the MCP server endpoint works with a Bearer token. We read executions
// through the MCP `search_executions` tool over JSON-RPC (stateless HTTP).
const MCP_URL = process.env.N8N_MCP_URL;
const MCP_TOKEN = process.env.N8N_MCP_TOKEN;

// Optional REST fallback (if a real Public API key + plan is added later).
const REST_BASE = process.env.N8N_BASE_URL;
const REST_KEY = process.env.N8N_API_KEY;

function mapExec(e: any): Execution {
  return {
    id: String(e.id),
    workflowId: e.workflowId,
    status: e.status,
    mode: e.mode,
    startedAt: e.startedAt,
    stoppedAt: e.stoppedAt ?? null,
  };
}

// Parse an MCP streamable-HTTP (SSE) response and return the JSON-RPC result.
function parseSseResult(text: string): any {
  // Body is a sequence of "event: ...\ndata: {json}\n\n" frames.
  const datas = text
    .split("\n")
    .filter((l) => l.startsWith("data:"))
    .map((l) => l.slice(5).trim());
  for (let i = datas.length - 1; i >= 0; i--) {
    try {
      const obj = JSON.parse(datas[i]);
      if (obj.result || obj.error) return obj;
    } catch {
      // skip non-JSON keepalive frames
    }
  }
  // Fall back to plain JSON body.
  return JSON.parse(text);
}

async function mcpCall(name: string, args: Record<string, unknown>): Promise<any> {
  const res = await fetch(MCP_URL as string, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MCP_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: { name, arguments: args },
    }),
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`MCP ${res.status}: ${text.slice(0, 120)}`);
  let payload;
  try {
    payload = parseSseResult(text);
  } catch (e) {
    throw new Error(`MCP parse fail. status=${res.status} body[0..120]=${JSON.stringify(text.slice(0, 120))}`);
  }
  if (payload.error) throw new Error(`MCP tool error: ${JSON.stringify(payload.error)}`);

  const result = payload.result ?? {};
  // Prefer structuredContent; fall back to the text content block (JSON string).
  if (result.structuredContent) return result.structuredContent;
  const textBlock = result.content?.find((c: any) => c.type === "text")?.text;
  if (textBlock) {
    try {
      return JSON.parse(textBlock);
    } catch {
      throw new Error(`MCP textBlock not JSON: ${JSON.stringify(textBlock.slice(0, 160))}`);
    }
  }
  throw new Error(`MCP no usable result. keys=${Object.keys(result).join(",")} payloadKeys=${Object.keys(payload).join(",")}`);
}

async function fetchViaMcp(limit = 200): Promise<{ execs: Execution[]; total: number }> {
  const sc = await mcpCall("search_executions", { limit });
  const data: any[] = sc.data ?? [];
  return { execs: data.map(mapExec), total: typeof sc.count === "number" ? sc.count : data.length };
}

async function fetchViaRest(limit = 250): Promise<{ execs: Execution[]; total: number }> {
  const out: Execution[] = [];
  let cursor: string | undefined;
  while (out.length < limit) {
    const url = new URL(`${REST_BASE}/api/v1/executions`);
    url.searchParams.set("limit", "100");
    url.searchParams.set("includeData", "false");
    if (cursor) url.searchParams.set("cursor", cursor);
    const res = await fetch(url, {
      headers: { "X-N8N-API-KEY": REST_KEY as string, accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`n8n REST ${res.status}`);
    const json = await res.json();
    const batch: Execution[] = (json.data ?? []).map(mapExec);
    out.push(...batch);
    cursor = json.nextCursor;
    if (!cursor || batch.length === 0) break;
  }
  const sliced = out.slice(0, limit);
  return { execs: sliced, total: sliced.length };
}

function aggregate(execs: Execution[], totalCount: number): AutomationSummary {
  const byWf = new Map<string, Execution[]>();
  for (const e of execs) {
    if (!byWf.has(e.workflowId)) byWf.set(e.workflowId, []);
    byWf.get(e.workflowId)!.push(e);
  }

  const perWorkflow: WorkflowStat[] = [];
  for (const [wfId, list] of Array.from(byWf.entries())) {
    const success = list.filter((e) => e.status === "success").length;
    const error = list.filter((e) => e.status === "error" || e.status === "crashed").length;
    const durations = list
      .filter((e) => e.stoppedAt)
      .map((e) => new Date(e.stoppedAt as string).getTime() - new Date(e.startedAt).getTime())
      .filter((d) => d >= 0);
    const avgMs = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : null;
    const lastRun = list.reduce<string | null>((acc, e) => (!acc || e.startedAt > acc ? e.startedAt : acc), null);
    const label = wfLabel(wfId);
    perWorkflow.push({
      workflowId: wfId,
      code: label.code,
      name: label.name,
      total: list.length,
      success,
      error,
      successRate: list.length ? Math.round((success / list.length) * 100) : 0,
      avgMs,
      lastRun,
    });
  }
  perWorkflow.sort((a, b) => b.total - a.total);

  const sampled = execs.length;
  const success = execs.filter((e) => e.status === "success").length;
  const error = execs.filter((e) => e.status === "error" || e.status === "crashed").length;

  const dayMap = new Map<string, { success: number; error: number }>();
  for (const e of execs) {
    const day = e.startedAt.slice(0, 10);
    if (!dayMap.has(day)) dayMap.set(day, { success: 0, error: 0 });
    const d = dayMap.get(day)!;
    if (e.status === "success") d.success++;
    else if (e.status === "error" || e.status === "crashed") d.error++;
  }
  const timeline = Array.from(dayMap.entries())
    .map(([day, v]) => ({ day, ...v }))
    .sort((a, b) => a.day.localeCompare(b.day))
    .slice(-14);

  const recentErrors = execs
    .filter((e) => e.status === "error" || e.status === "crashed")
    .slice(0, 12)
    .map((e) => {
      const l = wfLabel(e.workflowId);
      return { id: e.id, code: l.code, name: l.name, startedAt: e.startedAt };
    });

  return {
    source: "live",
    // Headline reflects the full count reported by n8n; rate is from the sample.
    totalRuns: totalCount || sampled,
    success,
    error,
    successRate: sampled ? Math.round((success / sampled) * 100) : 0,
    activeWorkflows: byWf.size,
    perWorkflow,
    timeline,
    recentErrors,
  };
}

export async function getAutomationSummary(): Promise<AutomationSummary> {
  try {
    if (MCP_URL && MCP_TOKEN) {
      const { execs, total } = await fetchViaMcp(200);
      return aggregate(execs, total);
    }
    if (REST_BASE && REST_KEY) {
      const { execs, total } = await fetchViaRest(250);
      return aggregate(execs, total);
    }
    return mockAutomation();
  } catch (e) {
    console.error("[n8n] live fetch failed, using mock:", (e as Error)?.message);
    return mockAutomation();
  }
}
