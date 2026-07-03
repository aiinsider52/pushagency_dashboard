// Maps n8n workflow IDs to human labels for the Push Agency automation stack.
export const WORKFLOWS: Record<string, { code: string; name: string }> = {
  yoYt5RdJ04bbsV8Z: { code: "WF-00", name: "Central Activity Log" },
  YC0myfdiXpVOkcL4: { code: "WF-01", name: "Fibery → ClickUp Sync (archived)" },
  YMkqU3EpZt2b6xpy: { code: "WF-01", name: "Fibery (Clients beta) → ClickUp Sync" },
  qCM1xdi5HDQVPXZg: { code: "WF-02", name: "Daily Sync Check" },
  "8YDSDU3YLMTl5MQn": { code: "WF-03", name: "Brief Validation" },
  Z9TSzf8QdTKjk6bt: { code: "WF-04", name: "SLA Monitoring" },
  KvzpcZSu3HUq2Pil: { code: "WF-05", name: "Self-QA Gate" },
  B8SsX016aycI8qUI: { code: "WF-06", name: "Client Delivery" },
  o0W8U70kWmfk1MSr: { code: "WF-07", name: "Revision Tracking" },
  rKDI3beeZfI7AdkH: { code: "WF-08", name: "On Hold Management" },
  pujSVWE6pZpCc07c: { code: "WF-09", name: "Financial Closure" },
  "9H7ihrQ5PPPemdRQ": { code: "WF-10", name: "Minor/Major Classifier" },
  jyJhqouDJ3RRbWuj: { code: "WF-11", name: "Task Summary for Designer" },
  "2rQsqRyvkglRIXFp": { code: "WF-12", name: "Workload Monitor" },
  dVYSySUWXQtMBRCH: { code: "WF-13", name: "Telegram Approval" },
};

export function wfLabel(id: string): { code: string; name: string } {
  return WORKFLOWS[id] ?? { code: id.slice(0, 6), name: "Unknown workflow" };
}
