import { AutomationSummary, PipelineSummary, FinanceSummary, ActivityRow } from "./types";

// Mock data mirrors the real stack seen on 2026-06-17 so the UI is meaningful
// before the .env keys are filled in.

export function mockAutomation(): AutomationSummary {
  const perWorkflow = [
    { code: "WF-01", name: "Fibery → ClickUp Sync", total: 1980, success: 41, error: 1939 },
    { code: "WF-04", name: "SLA Monitoring", total: 360, success: 12, error: 348 },
    { code: "WF-00", name: "Central Activity Log", total: 64, success: 64, error: 0 },
    { code: "WF-13", name: "Telegram Approval", total: 31, success: 27, error: 4 },
    { code: "WF-09", name: "Financial Closure", total: 18, success: 18, error: 0 },
    { code: "WF-05", name: "Self-QA Gate", total: 16, success: 16, error: 0 },
    { code: "WF-06", name: "Client Delivery", total: 12, success: 12, error: 0 },
    { code: "WF-03", name: "Brief Validation", total: 11, success: 11, error: 0 },
    { code: "WF-12", name: "Workload Monitor", total: 9, success: 8, error: 1 },
    { code: "WF-11", name: "Task Summary for Designer", total: 7, success: 7, error: 0 },
    { code: "WF-07", name: "Revision Tracking", total: 6, success: 6, error: 0 },
    { code: "WF-08", name: "On Hold Management", total: 5, success: 5, error: 0 },
    { code: "WF-02", name: "Daily Sync Check", total: 4, success: 3, error: 1 },
  ].map((w, i) => ({
    workflowId: `mock-${i}`,
    ...w,
    successRate: Math.round((w.success / w.total) * 100),
    avgMs: 800 + i * 120,
    lastRun: new Date(Date.now() - i * 3600_000).toISOString(),
  }));

  const totalRuns = perWorkflow.reduce((a, w) => a + w.total, 0);
  const success = perWorkflow.reduce((a, w) => a + w.success, 0);
  const error = perWorkflow.reduce((a, w) => a + w.error, 0);

  const timeline = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86400_000);
    return { day: d.toISOString().slice(0, 10), success: 4 + (i % 4), error: 120 + ((i * 17) % 90) };
  });

  const recentErrors = Array.from({ length: 8 }).map((_, i) => ({
    id: `${2843 - i}`,
    code: i % 5 === 0 ? "WF-04" : "WF-01",
    name: i % 5 === 0 ? "SLA Monitoring" : "Fibery → ClickUp Sync",
    startedAt: new Date(Date.now() - i * 300_000).toISOString(),
  }));

  return {
    source: "mock",
    totalRuns,
    success,
    error,
    successRate: Math.round((success / totalRuns) * 100),
    activeWorkflows: perWorkflow.length,
    perWorkflow,
    timeline,
    recentErrors,
  };
}

export function mockPipeline(): PipelineSummary {
  return {
    source: "mock",
    total: 9,
    byStatus: [
      { status: "backlog", count: 1 },
      { status: "to do", count: 2 },
      { status: "in progress", count: 2 },
      { status: "design done", count: 1 },
      { status: "on hold", count: 1 },
      { status: "client review", count: 1 },
      { status: "Closed", count: 1 },
    ],
    byAssignee: [
      { assignee: "Treesher :D", total: 5, overdue: 3, urgent: 2 },
      { assignee: "unassigned", total: 4, overdue: 0, urgent: 0 },
    ],
  };
}

export function mockFinance(): FinanceSummary {
  return {
    source: "mock",
    closedCount: 3,
    revenue: 22000,
    avgCheck: 7333,
    byMonth: [
      { month: "2026-05", revenue: 6000, count: 1 },
      { month: "2026-06", revenue: 16000, count: 2 },
    ],
  };
}

export function mockActivity(): ActivityRow[] {
  const base = [
    ["WF-13", "Telegram Approval", "client_approval", "Reels для Instagram", "Олена", "success", "Client approved"],
    ["WF-09", "Financial Closure", "task_delivered_financial", "Reels для Instagram", "Treesher :D", "success", "Price: 8000 | Revisions: 1"],
    ["WF-06", "Client Delivery", "delivered_to_client", "Reels для Instagram", "Treesher :D", "success", "Delivered via Telegram"],
    ["WF-05", "Self-QA Gate", "qa_passed", "Reels для Instagram", "Treesher :D", "success", "Moved to Internal Review"],
    ["WF-07", "Revision Tracking", "revision_started", "Reels для Instagram", "Treesher :D", "success", "Revision #1 | Minor"],
    ["WF-12", "Workload Monitor", "workload_overload", "", "Treesher :D", "warning", "1 overloaded | 5 tasks"],
    ["WF-03", "Brief Validation", "brief_validated", "Reels для Instagram", "Treesher :D", "success", "Brief is valid"],
    ["WF-01", "Fibery → ClickUp Sync", "sync_error", "Black Friday банер", "", "error", "Execution limit reached"],
  ];
  return base.map((r, i) => ({
    timestamp: new Date(Date.now() - i * 600_000).toISOString(),
    wfId: r[0],
    wfName: r[1],
    eventType: r[2],
    taskName: r[3],
    assignee: r[4],
    result: r[5],
    details: r[6],
  }));
}
