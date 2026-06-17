import { PipelineSummary, FinanceSummary } from "./types";
import { mockPipeline, mockFinance } from "./mock";

const TOKEN = process.env.CLICKUP_TOKEN;
const LIST = process.env.CLICKUP_LIST_ID || "901218728372";

const FIELD_CLIENT_PRICE = "e7abeb9a-e864-4fdc-a363-f3b4700addbc";

async function fetchTasks(): Promise<any[]> {
  const out: any[] = [];
  let page = 0;
  while (true) {
    const url = `https://api.clickup.com/api/v2/list/${LIST}/task?include_closed=true&subtasks=true&page=${page}`;
    const res = await fetch(url, {
      headers: { Authorization: TOKEN as string },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`ClickUp API ${res.status}`);
    const json = await res.json();
    const tasks = json.tasks ?? [];
    out.push(...tasks);
    if (tasks.length === 0 || json.last_page) break;
    page++;
    if (page > 20) break;
  }
  return out;
}

function getField(task: any, id: string): string | undefined {
  return (task.custom_fields ?? []).find((f: any) => f.id === id)?.value;
}

export async function getPipelineSummary(): Promise<PipelineSummary> {
  if (!TOKEN) return mockPipeline();
  try {
    const tasks = await fetchTasks();
    const statusMap = new Map<string, number>();
    const assigneeMap = new Map<string, { total: number; overdue: number; urgent: number }>();
    const now = Date.now();

    for (const t of tasks) {
      const status = t.status?.status ?? "unknown";
      statusMap.set(status, (statusMap.get(status) ?? 0) + 1);

      const assignees = t.assignees?.length ? t.assignees : [{ username: "unassigned" }];
      for (const a of assignees) {
        const name = a.username || a.email || "unassigned";
        if (!assigneeMap.has(name)) assigneeMap.set(name, { total: 0, overdue: 0, urgent: 0 });
        const rec = assigneeMap.get(name)!;
        rec.total++;
        if (t.due_date && Number(t.due_date) < now) rec.overdue++;
        if (t.priority?.priority === "urgent") rec.urgent++;
      }
    }

    return {
      source: "live",
      total: tasks.length,
      byStatus: Array.from(statusMap.entries()).map(([status, count]) => ({ status, count })),
      byAssignee: Array.from(assigneeMap.entries())
        .map(([assignee, v]) => ({ assignee, ...v }))
        .sort((a, b) => b.total - a.total),
    };
  } catch {
    return mockPipeline();
  }
}

export async function getFinanceSummary(): Promise<FinanceSummary> {
  if (!TOKEN) return mockFinance();
  try {
    const tasks = await fetchTasks();
    const closed = tasks.filter(
      (t) => t.status?.type === "closed" || ["closed", "delivered"].includes((t.status?.status ?? "").toLowerCase())
    );
    let revenue = 0;
    const monthMap = new Map<string, { revenue: number; count: number }>();
    for (const t of closed) {
      const price = Number(getField(t, FIELD_CLIENT_PRICE) ?? 0) || 0;
      revenue += price;
      const ts = Number(t.date_closed || t.date_updated || t.date_created);
      const month = new Date(ts).toISOString().slice(0, 7);
      if (!monthMap.has(month)) monthMap.set(month, { revenue: 0, count: 0 });
      const m = monthMap.get(month)!;
      m.revenue += price;
      m.count++;
    }
    return {
      source: "live",
      closedCount: closed.length,
      revenue,
      avgCheck: closed.length ? Math.round(revenue / closed.length) : 0,
      byMonth: Array.from(monthMap.entries())
        .map(([month, v]) => ({ month, ...v }))
        .sort((a, b) => a.month.localeCompare(b.month)),
    };
  } catch {
    return mockFinance();
  }
}
