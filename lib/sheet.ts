import { ActivityRow } from "./types";
import { mockActivity } from "./mock";

const CSV = process.env.SHEET_CSV_URL;

// Minimal CSV parser that handles quoted fields and embedded commas/newlines.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c === "\r") { /* skip */ }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

export async function getActivity(limit = 100): Promise<{ source: "live" | "mock"; rows: ActivityRow[] }> {
  if (!CSV) return { source: "mock", rows: mockActivity() };
  try {
    const res = await fetch(CSV, { cache: "no-store" });
    if (!res.ok) throw new Error(`Sheet ${res.status}`);
    const text = await res.text();
    const rows = parseCsv(text);
    if (rows.length < 2) return { source: "mock", rows: mockActivity() };
    // Expected columns: Timestamp, WF_ID, WF_Name, Event_Type, Task_Name, Task_ID, Assignee, Result, Details
    const body = rows.slice(1).map((r) => ({
      timestamp: r[0] ?? "",
      wfId: r[1] ?? "",
      wfName: r[2] ?? "",
      eventType: r[3] ?? "",
      taskName: r[4] ?? "",
      assignee: r[6] ?? "",
      result: r[7] ?? "",
      details: r[8] ?? "",
    }));
    body.reverse();
    return { source: "live", rows: body.slice(0, limit) };
  } catch {
    return { source: "mock", rows: mockActivity() };
  }
}
