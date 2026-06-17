export type ExecStatus = "success" | "error" | "running" | "waiting" | "canceled" | "crashed" | "unknown" | "new";

export interface Execution {
  id: string;
  workflowId: string;
  status: ExecStatus;
  mode: string;
  startedAt: string;
  stoppedAt: string | null;
}

export interface WorkflowStat {
  workflowId: string;
  code: string;
  name: string;
  total: number;
  success: number;
  error: number;
  successRate: number;
  avgMs: number | null;
  lastRun: string | null;
}

export interface AutomationSummary {
  source: "live" | "mock";
  totalRuns: number;
  success: number;
  error: number;
  successRate: number;
  activeWorkflows: number;
  perWorkflow: WorkflowStat[];
  timeline: { day: string; success: number; error: number }[];
  recentErrors: { id: string; code: string; name: string; startedAt: string }[];
}

export interface PipelineSummary {
  source: "live" | "mock";
  total: number;
  byStatus: { status: string; count: number }[];
  byAssignee: { assignee: string; total: number; overdue: number; urgent: number }[];
}

export interface FinanceSummary {
  source: "live" | "mock";
  closedCount: number;
  revenue: number;
  avgCheck: number;
  byMonth: { month: string; revenue: number; count: number }[];
}

export interface ActivityRow {
  timestamp: string;
  wfId: string;
  wfName: string;
  eventType: string;
  taskName: string;
  assignee: string;
  result: string;
  details: string;
}
