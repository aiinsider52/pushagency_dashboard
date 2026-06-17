"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, Stat, Badge, Avatar, Delta, Segmented, LoadingSkeleton, Modal } from "./ui";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useTheme } from "./ThemeProvider";
import { getChartTheme } from "@/lib/theme";
import { PageId, isPageId, PAGE_META } from "@/lib/nav";
import { buildNotifications, NotificationItem } from "@/lib/notifications";
import { AutomationSummary, PipelineSummary, FinanceSummary, ActivityRow } from "@/lib/types";

const fetcher = (u: string) => fetch(u).then((r) => r.json());

const STATUS_COLORS: Record<string, string> = {
  backlog: "#5a6078",
  "to do": "#7a8199",
  "in progress": "#5eb8ff",
  "design done": "#b35cff",
  "internal review": "#fbbf24",
  "client review": "#ff5ca8",
  approved: "#34d399",
  "on hold": "#f87171",
  delivered: "#2dd4bf",
  Closed: "#8b7bff",
};

function ms(n: number | null) {
  if (n == null) return "—";
  if (n < 1000) return `${Math.round(n)}ms`;
  return `${(n / 1000).toFixed(1)}s`;
}

function toSparkline(timeline: { day: string; success: number; error: number }[], key: "success" | "error" | "total") {
  return timeline.map((d) => ({ day: d.day, v: key === "total" ? d.success + d.error : d[key] }));
}

function matchesSearch(q: string, ...fields: (string | undefined | null)[]) {
  if (!q.trim()) return true;
  const lower = q.toLowerCase();
  return fields.some((f) => f?.toLowerCase().includes(lower));
}

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const chart = getChartTheme(theme);
  const pageParam = searchParams.get("page");
  const page: PageId = isPageId(pageParam) ? pageParam : "overview";

  const [period, setPeriod] = useState("Місяць");
  const [search, setSearch] = useState("");
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [helpOpen, setHelpOpen] = useState(false);

  const { data: auto, mutate: mutateAuto } = useSWR<AutomationSummary>("/api/automation", fetcher, { refreshInterval: 30000 });
  const { data: pipe, mutate: mutatePipe } = useSWR<PipelineSummary>("/api/pipeline", fetcher, { refreshInterval: 30000 });
  const { data: fin, mutate: mutateFin } = useSWR<FinanceSummary>("/api/finance", fetcher, { refreshInterval: 60000 });
  const { data: act, mutate: mutateAct } = useSWR<{ source: string; rows: ActivityRow[] }>("/api/activity", fetcher, {
    refreshInterval: 20000,
  });

  const setPage = useCallback(
    (p: PageId) => {
      router.replace(`/?page=${p}`, { scroll: false });
      setSearch("");
    },
    [router]
  );

  const refreshAll = useCallback(() => {
    mutateAuto();
    mutatePipe();
    mutateFin();
    mutateAct();
  }, [mutateAuto, mutatePipe, mutateFin, mutateAct]);

  const loading = !auto || !pipe || !fin || !act;
  const timeline = auto ? (period === "Тиждень" ? auto.timeline.slice(-7) : auto.timeline) : [];
  const maxLoad = pipe ? Math.max(1, ...pipe.byAssignee.map((a) => a.total)) : 1;

  const runsDelta = (() => {
    if (!auto || auto.timeline.length < 2) return 0;
    const a = auto.timeline.at(-1)!;
    const b = auto.timeline.at(-2)!;
    const cur = a.success + a.error;
    const prev = b.success + b.error || 1;
    return Math.round(((cur - prev) / prev) * 100);
  })();

  const mockSources = [
    auto?.source === "mock" ? "n8n" : "",
    pipe?.source === "mock" ? "ClickUp" : "",
    fin?.source === "mock" ? "Finance" : "",
    act?.source === "mock" ? "Activity Log" : "",
  ].filter(Boolean);

  const notifications = useMemo(
    () => buildNotifications(auto, pipe, act?.rows, mockSources),
    [auto, pipe, act?.rows, mockSources]
  );

  const sources = [
    { name: "n8n", live: auto?.source === "live" },
    { name: "ClickUp", live: pipe?.source === "live" },
    { name: "Central Log", live: act?.source === "live" },
  ];

  const filteredWorkflows = auto?.perWorkflow.filter((w) => matchesSearch(search, w.code, w.name)) ?? [];
  const filteredActivity =
    act?.rows.filter((r) => matchesSearch(search, r.taskName, r.wfId, r.wfName, r.assignee, r.details, r.eventType)) ?? [];
  const filteredAssignees =
    pipe?.byAssignee.filter((a) => matchesSearch(search, a.assignee)) ?? [];

  const runsSpark = auto ? toSparkline(auto.timeline, "total") : [];
  const successSpark = auto ? toSparkline(auto.timeline, "success") : [];
  const revSpark = fin?.byMonth.map((m) => ({ day: m.month, v: m.revenue })) ?? [];

  const kpiRow = auto && pipe && fin && (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Stat label="Виконань n8n" featured value={auto.totalRuns.toLocaleString()} sub={`${auto.activeWorkflows} активних воркфлоу`} delta={<Delta value={runsDelta} />} sparkline={runsSpark} icon={<IconGear />} />
      <Stat label="Success rate" tone={auto.successRate > 80 ? "ok" : auto.successRate > 50 ? "warn" : "err"} value={`${auto.successRate}%`} sub={`${auto.error.toLocaleString()} помилок`} sparkline={successSpark} icon={<IconCheck />} />
      <Stat label="Задач у воронці" tone="brand" value={pipe.total} sub={`${pipe.byStatus.length} статусів`} icon={<IconFolder />} />
      <Stat label="Виручка" tone="ok" value={`₴${fin.revenue.toLocaleString()}`} sub={`avg ₴${fin.avgCheck.toLocaleString()} · ${fin.closedCount} закрито`} sparkline={revSpark} icon={<IconMoney />} />
    </section>
  );

  const automationChart = auto && (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Активність автоматизації" className="lg:col-span-2" glow right={<Segmented options={["Тиждень", "Місяць", "Все"]} value={period} onChange={setPeriod} />}>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={timeline} margin={{ left: -12, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="g-ok" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="g-err" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f87171" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke={chart.gridStroke} vertical={false} />
            <XAxis dataKey="day" tick={{ fill: chart.tickFill, fontSize: 11 }} tickFormatter={(d) => d.slice(5)} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: chart.tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={chart.tooltipStyle} />
            <Area type="monotone" dataKey="error" stroke="#f87171" strokeWidth={2} fill="url(#g-err)" name="помилки" isAnimationActive={false} />
            <Area type="monotone" dataKey="success" stroke="#34d399" strokeWidth={2.5} fill="url(#g-ok)" name="успіх" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
      <ErrorsList errors={auto.recentErrors} />
    </section>
  );

  const workflowTable = auto && (
    <Card title="По воркфлоу — що і скільки зробив n8n">
      {search && filteredWorkflows.length === 0 && <EmptySearch />}
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted text-[10px] uppercase tracking-wider">
              <th className="text-left pb-3 pl-2 font-semibold">WF</th>
              <th className="text-left pb-3 font-semibold">Назва</th>
              <th className="text-right pb-3 font-semibold">Виконань</th>
              <th className="text-left pb-3 font-semibold pl-6">Success</th>
              <th className="text-right pb-3 font-semibold">Сер. час</th>
              <th className="text-right pb-3 pr-2 font-semibold">Останній</th>
            </tr>
          </thead>
          <tbody>
            {filteredWorkflows.map((w) => {
              const tone = w.successRate > 80 ? "#34d399" : w.successRate > 50 ? "#fbbf24" : "#f87171";
              return (
                <tr key={w.workflowId} className="border-t border-border hover:bg-hover transition-colors group">
                  <td className="py-3 pl-2"><span className="font-mono text-[10px] font-semibold text-brand bg-brand/10 border border-brand/20 rounded-lg px-2 py-1">{w.code}</span></td>
                  <td className="py-3 text-ink/90 group-hover:text-ink">{w.name}</td>
                  <td className="py-3 text-right tabular-nums font-semibold text-ink">{w.total.toLocaleString()}</td>
                  <td className="py-3 pl-6">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-track overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${w.successRate}%`, background: tone, boxShadow: `0 0 8px ${tone}66` }} />
                      </div>
                      <span className="tabular-nums text-xs font-medium" style={{ color: tone }}>{w.successRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-right text-muted tabular-nums font-mono text-xs">{ms(w.avgMs)}</td>
                  <td className="py-3 text-right text-muted text-xs tabular-nums pr-2">
                    {w.lastRun ? new Date(w.lastRun).toLocaleString("uk-UA", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const pipelineSection = pipe && (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Воронка по статусах">
        <div className="relative">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pipe.byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={72} outerRadius={105} paddingAngle={3} isAnimationActive={false}>
                {pipe.byStatus.map((s) => (
                  <Cell key={s.status} stroke={chart.pieStroke} strokeWidth={3} fill={STATUS_COLORS[s.status] ?? "#8b7bff"} />
                ))}
              </Pie>
              <Tooltip contentStyle={chart.tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <div className="text-center">
              <div className="text-[36px] font-extrabold text-ink leading-none tabular-nums">{pipe.total}</div>
              <div className="text-[11px] text-muted mt-0.5">задач</div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-2 mt-3">
          {pipe.byStatus.map((s) => (
            <span key={s.status} className="inline-flex items-center gap-1.5 text-[11px] text-muted">
              <span className="w-2 h-2 rounded-full glow-dot" style={{ background: STATUS_COLORS[s.status] ?? "#8b7bff", color: STATUS_COLORS[s.status] ?? "#8b7bff" }} />
              {s.status} · {s.count}
            </span>
          ))}
        </div>
      </Card>
      <Card title="Навантаження команди">
        {search && filteredAssignees.length === 0 && <EmptySearch />}
        <div className="space-y-4 pt-1">
          {(search ? filteredAssignees : pipe.byAssignee).map((a) => (
            <div key={a.assignee} className="flex items-center gap-3">
              <Avatar name={a.assignee} size={36} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-ink truncate">{a.assignee}</span>
                  <span className="text-xs text-muted tabular-nums">{a.total} задач</span>
                </div>
                <div className="h-2 rounded-full bg-track overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand2 shadow-glow-sm" style={{ width: `${(a.total / maxLoad) * 100}%` }} />
                </div>
              </div>
              {a.overdue > 0 && <span className="text-[10px] font-semibold text-err bg-err/10 border border-err/20 rounded-full px-2 py-0.5 shrink-0">{a.overdue} простр.</span>}
            </div>
          ))}
        </div>
      </Card>
    </section>
  );

  const financeSection = fin && (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <Card title="Виручка по місяцях" glow>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={fin.byMonth} margin={{ left: -12, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="g-rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b7bff" />
                  <stop offset="100%" stopColor="#b35cff" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke={chart.gridStroke} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: chart.tickFill, fontSize: 11 }} tickFormatter={(m) => m.slice(5)} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: chart.tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chart.tooltipStyle} cursor={{ fill: chart.cursorFill }} />
              <Bar dataKey="revenue" fill="url(#g-rev)" name="виручка" radius={[10, 10, 0, 0]} barSize={42} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card title="Підсумок">
        <div className="space-y-4 pt-2">
          <FinanceRow label="Загальна виручка" value={`₴${fin.revenue.toLocaleString()}`} />
          <FinanceRow label="Середній чек" value={`₴${fin.avgCheck.toLocaleString()}`} />
          <FinanceRow label="Закритих проєктів" value={String(fin.closedCount)} />
          {fin.byMonth.map((m) => (
            <FinanceRow key={m.month} label={m.month} value={`₴${m.revenue.toLocaleString()} · ${m.count} шт.`} small />
          ))}
        </div>
      </Card>
    </section>
  );

  const activityFeed = (
    <Card title="Живий feed подій · Central Log">
      {search && filteredActivity.length === 0 && <EmptySearch />}
      <div className="space-y-0.5 max-h-[520px] overflow-y-auto pr-1">
        {filteredActivity.map((r, i) => (
          <div key={`${r.timestamp}-${r.wfId}-${i}`} className="flex items-center gap-3 text-sm rounded-xl px-3 py-2.5 hover:bg-hover border border-transparent hover:border-border transition-all">
            <span className="text-muted text-[11px] tabular-nums w-24 shrink-0 font-mono">
              {r.timestamp ? new Date(r.timestamp).toLocaleString("uk-UA", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}
            </span>
            <span className="font-mono text-[10px] font-semibold text-brand bg-brand/10 border border-brand/20 rounded-lg px-2 py-1 w-[52px] text-center shrink-0">{r.wfId}</span>
            <Badge result={r.result} />
            {r.assignee && <Avatar name={r.assignee} size={24} />}
            <span className="flex-1 truncate text-ink/75">
              {r.taskName && <span className="font-medium text-ink">{r.taskName} · </span>}
              <span className="text-muted">{r.details}</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );

  const pageContent = (() => {
    if (!auto || !pipe || !fin || !act) return null;
    switch (page) {
      case "overview":
        return (
          <>
            {kpiRow}
            {automationChart}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pipe && (
                <Card title="Воронка · коротко">
                  <div className="flex flex-wrap gap-2">
                    {pipe.byStatus.map((s) => (
                      <span key={s.status} className="inline-flex items-center gap-1.5 text-xs bg-hover border border-border rounded-full px-3 py-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[s.status] ?? "#8b7bff" }} />
                        {s.status} <b className="text-ink">{s.count}</b>
                      </span>
                    ))}
                  </div>
                  <button type="button" onClick={() => setPage("pipeline")} className="mt-4 text-xs text-brand hover:underline">
                    Відкрити воронку →
                  </button>
                </Card>
              )}
              <Card title="Останні події">
                <div className="space-y-1">
                  {act.rows.slice(0, 6).map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs py-1.5">
                      <Badge result={r.result} />
                      <span className="truncate text-muted">{r.taskName || r.details}</span>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setPage("activity")} className="mt-3 text-xs text-brand hover:underline">
                  Весь feed →
                </button>
              </Card>
            </section>
          </>
        );
      case "automation":
        return (
          <>
            {kpiRow && (
              <section className="grid grid-cols-2 gap-4 max-w-xl">
                <Stat label="Виконань n8n" featured value={auto.totalRuns.toLocaleString()} sub={`${auto.activeWorkflows} WF`} delta={<Delta value={runsDelta} />} sparkline={runsSpark} />
                <Stat label="Success rate" tone={auto.successRate > 80 ? "ok" : auto.successRate > 50 ? "warn" : "err"} value={`${auto.successRate}%`} sub={`${auto.error} помилок`} sparkline={successSpark} />
              </section>
            )}
            {automationChart}
            {workflowTable}
          </>
        );
      case "pipeline":
        return (
          <>
            <section className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-w-2xl">
              <Stat label="Задач у воронці" tone="brand" value={pipe.total} sub={`${pipe.byStatus.length} статусів`} icon={<IconFolder />} />
              <Stat label="Виконавців" tone="brand" value={pipe.byAssignee.length} sub={`${pipe.byAssignee.reduce((a, x) => a + x.overdue, 0)} прострочено`} />
            </section>
            {pipelineSection}
          </>
        );
      case "finance":
        return (
          <>
            <section className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-w-2xl">
              <Stat label="Виручка" tone="ok" value={`₴${fin.revenue.toLocaleString()}`} sub={`${fin.closedCount} закрито`} sparkline={revSpark} icon={<IconMoney />} />
              <Stat label="Середній чек" tone="ok" value={`₴${fin.avgCheck.toLocaleString()}`} />
            </section>
            {financeSection}
          </>
        );
      case "activity":
        return activityFeed;
      default:
        return null;
    }
  })();

  return (
    <div className="min-h-screen flex">
      <Sidebar active={page} onChange={setPage} onHelp={() => setHelpOpen(true)} />

      <div className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
        <div className="max-w-[1200px] mx-auto">
          <Topbar
            page={page}
            period={period}
            setPeriod={setPeriod}
            search={search}
            setSearch={setSearch}
            notifications={notifications}
            readIds={readIds}
            onMarkAllRead={() => setReadIds(new Set(notifications.map((n) => n.id)))}
            onNotificationClick={(n: NotificationItem) => {
              setReadIds((prev) => new Set([...prev, n.id]));
              setPage(n.page);
            }}
            sources={sources}
            onRefresh={refreshAll}
          />

          {mockSources.length > 0 && (
            <div className="bg-warn/8 border border-warn/20 text-warn rounded-2xl px-4 py-3 text-sm flex items-center gap-2.5 mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-warn glow-dot shrink-0" />
              <span>
                Демо-режим: <b className="text-ink">{mockSources.join(", ")}</b> на мок-даних. Заповни{" "}
                <code className="font-mono text-xs bg-warn/10 px-1.5 py-0.5 rounded border border-warn/20">.env.local</code> для живих даних.
              </span>
            </div>
          )}

          {loading ? <LoadingSkeleton /> : <div className="space-y-5 animate-fade-up">{pageContent}</div>}

          {!loading && (
            <footer className="text-center text-muted/60 text-xs py-4 font-mono">
              {PAGE_META[page].label} · PushDash · n8n · ClickUp · Central Log
            </footer>
          )}
        </div>
      </div>

      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="Документація PushDash">
        <div className="space-y-4 text-sm text-muted leading-relaxed">
          <p><b className="text-ink">Огляд</b> — загальні KPI, графік n8n та останні події.</p>
          <p><b className="text-ink">Автоматизація</b> — executions, помилки та таблиця WF-00…WF-13.</p>
          <p><b className="text-ink">Воронка</b> — ClickUp статуси та навантаження команди.</p>
          <p><b className="text-ink">Фінанси</b> — виручка з поля Client Price.</p>
          <p><b className="text-ink">Активність</b> — Central Log з Google Sheet.</p>
          <div className="rounded-xl bg-hover border border-border p-3 font-mono text-xs">
            N8N_BASE_URL · N8N_API_KEY<br />
            CLICKUP_TOKEN · CLICKUP_LIST_ID<br />
            SHEET_CSV_URL
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ErrorsList({ errors }: { errors: AutomationSummary["recentErrors"] }) {
  return (
    <Card title="Останні помилки">
      <div className="space-y-1 max-h-[260px] overflow-y-auto pr-1">
        {errors.length === 0 && <div className="text-muted text-sm py-12 text-center"><div className="text-2xl mb-2">✓</div>Помилок немає</div>}
        {errors.map((e) => (
          <div key={e.id} className="flex items-center gap-3 text-sm rounded-xl px-3 py-2.5 hover:bg-hover border border-transparent hover:border-border transition-all">
            <span className="font-mono text-[10px] font-semibold text-err bg-err/10 border border-err/20 rounded-lg px-2 py-1 shrink-0">{e.code}</span>
            <span className="text-ink/80 truncate flex-1 text-[13px]">{e.name}</span>
            <span className="text-muted text-[11px] shrink-0 tabular-nums">{new Date(e.startedAt).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function FinanceRow({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={`text-muted ${small ? "text-xs" : "text-sm"}`}>{label}</span>
      <span className={`font-semibold text-ink tabular-nums ${small ? "text-xs" : "text-sm"}`}>{value}</span>
    </div>
  );
}

function EmptySearch() {
  return <div className="text-center text-muted text-sm py-6 mb-2">Нічого не знайдено за вашим запитом</div>;
}

function IconGear() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" />
      <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconFolder() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  );
}
function IconMoney() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
