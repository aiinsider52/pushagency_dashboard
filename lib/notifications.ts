import { ActivityRow, AutomationSummary, PipelineSummary } from "./types";
import { PageId } from "./nav";

export type NotificationItem = {
  id: string;
  type: "error" | "warning" | "info";
  title: string;
  body: string;
  time: string;
  page: PageId;
};

export function buildNotifications(
  auto: AutomationSummary | undefined,
  pipe: PipelineSummary | undefined,
  act: ActivityRow[] | undefined,
  mockSources: string[]
): NotificationItem[] {
  const items: NotificationItem[] = [];

  if (mockSources.length > 0) {
    items.push({
      id: "mock-mode",
      type: "warning",
      title: "Демо-режим",
      body: `${mockSources.join(", ")} працюють на мок-даних`,
      time: new Date().toISOString(),
      page: "overview",
    });
  }

  auto?.recentErrors.slice(0, 6).forEach((e) => {
    items.push({
      id: `err-${e.id}`,
      type: "error",
      title: `${e.code} · ${e.name}`,
      body: "Помилка виконання n8n workflow",
      time: e.startedAt,
      page: "automation",
    });
  });

  pipe?.byAssignee
    .filter((a) => a.overdue > 0)
    .forEach((a) => {
      items.push({
        id: `overdue-${a.assignee}`,
        type: "warning",
        title: `Прострочені задачі · ${a.assignee}`,
        body: `${a.overdue} задач прострочено`,
        time: new Date().toISOString(),
        page: "pipeline",
      });
    });

  act
    ?.filter((r) => r.result === "error" || r.result === "warning")
    .slice(0, 5)
    .forEach((r, i) => {
      items.push({
        id: `act-${r.timestamp}-${i}`,
        type: r.result === "error" ? "error" : "warning",
        title: `${r.wfId} · ${r.wfName}`,
        body: r.details || r.taskName || r.eventType,
        time: r.timestamp,
        page: "activity",
      });
    });

  return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}
