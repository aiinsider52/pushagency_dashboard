import { Execution, AutomationSummary, WorkflowStat } from "./types";
import { wfLabel } from "./workflows";
import { mockAutomation } from "./mock";

const BASE = process.env.N8N_BASE_URL;
const KEY = process.env.N8N_API_KEY;

// Pull executions from the n8n public REST API, paging through results.
async function fetchExecutions(limit = 250): Promise<Execution[]> {
  const out: Execution[] = [];
  let cursor: string | undefined;

  while (out.length < limit) {
    const url = new URL(`${BASE}/api/v1/executions`);
    url.searchParams.set("limit", "100");
    url.searchParams.set("includeData", "false");
    if (cursor) url.searchParams.set("cursor", cursor);

    const res = await fetch(url, {
      headers: { "X-N8N-API-KEY": KEY as string, accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`n8n API ${res.status}`);
    const json = await res.json();
    const batch: Execution[] = (json.data ?? []).map((e: any) => ({
      id: String(e.id),
      workflowId: e.workflowId,
      status: e.status,
      mode: e.mode,
      startedAt: e.startedAt,
      stoppedAt: e.stoppedAt ?? null,
    }));
    out.push(...batch);
    cursor = json.nextCursor;
    if (!cursor || batch.length === 0) break;
  }
  return out.slice(0, limit);
}

function aggregate(execs: Execution[]): AutomationSummary {
  const byWf = new Map<string, Execution[]>();
  for (const e of execs) {
    if (!byWf.has(e.workflowId)) byWf.set(e.workflowId, []);
    byWf.get(e.workflowId)!.push(e);
  }

  const perWorkflow: WorkflowStat[] = [];
  for (const [wfId, list] of byWf) {
    const success = list.filter((e) => e.status === "success").length;
    const error = list.filter((e) => e.status === "error" || e.status === "crashed").length;
    const durations = list
      .filter((e) => e.stoppedAt)
      .map((e) => new Date(e.stoppedAt as string).getTime() - new Date(e.startedAt).getTime())
      .filter((d) => d >= 0);
    const avgMs = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : null;
    const lastRun = list.reduce<string | null>(
      (acc, e) => (!acc || e.startedAt > acc ? e.startedAt : acc),
      null
    );
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

  const totalRuns = execs.length;
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
    totalRuns,
    success,
    error,
    successRate: totalRuns ? Math.round((success / totalRuns) * 100) : 0,
    activeWorkflows: byWf.size,
    perWorkflow,
    timeline,
    recentErrors,
  };
}

export async function getAutomationSummary(): Promise<AutomationSummary> {
  if (!BASE || !KEY) return mockAutomation();
  try {
    const execs = await fetchExecutions(250);
    return aggregate(execs);
  } catch {
    return mockAutomation();
  }
}
