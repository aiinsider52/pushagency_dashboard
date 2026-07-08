"use client";

import { useEffect, useState } from "react";
import { Card } from "./ui";

type Rate = {
  Category: string;
  "Client Price": string | number;
  "Designer Price": string | number;
};

export default function RatesEditor() {
  const [rows, setRows] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/rates")
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch((e) => setErr(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const setVal = (i: number, key: "Client Price" | "Designer Price", v: string) => {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [key]: v } : r)));
    setSavedAt(null);
  };

  const save = async () => {
    setSaving(true);
    setErr(null);
    try {
      const payload = rows.map((r) => ({
        Category: r.Category,
        "Client Price": r["Client Price"],
        "Designer Price": r["Designer Price"],
      }));
      const res = await fetch("/api/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`save failed (${res.status})`);
      setSavedAt(new Date().toLocaleTimeString());
    } catch (e) {
      setErr((e as Error).message || String(e));
    } finally {
      setSaving(false);
    }
  };

  const cell =
    "w-28 bg-surface3 border border-border rounded-lg px-3 py-1.5 text-sm text-ink tabular-nums focus:outline-none focus:border-brand text-right";

  return (
    <Card
      title="Тарифи · ставки для розрахунку цін"
      right={
        <div className="flex items-center gap-3">
          {savedAt && <span className="text-[11px] text-ok">збережено {savedAt}</span>}
          {err && <span className="text-[11px] text-err">{err}</span>}
          <button
            type="button"
            onClick={save}
            disabled={saving || loading}
            className="text-xs font-semibold px-4 py-2 rounded-full bg-brand text-white shadow-soft disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {saving ? "Збереження…" : "Зберегти"}
          </button>
        </div>
      }
    >
      <p className="text-[12px] text-muted mb-4">
        Ці ставки читає n8n при розрахунку цін (PRICE у фін-таблицях). Зміни зберігаються в Google Sheet миттєво.
      </p>

      {loading ? (
        <div className="h-40 rounded-xl shimmer" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted">Порожньо. Перевір, що n8n WF-18 активний.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-muted border-b border-border">
                <th className="text-left font-semibold py-2 pr-4">Категорія</th>
                <th className="text-right font-semibold py-2 px-2">Client €</th>
                <th className="text-right font-semibold py-2 pl-2">Designer €</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.Category || i} className="border-b border-border/60 last:border-0">
                  <td className="py-2.5 pr-4 text-ink font-medium">{r.Category}</td>
                  <td className="py-2.5 px-2 text-right">
                    <input
                      type="number"
                      inputMode="decimal"
                      value={r["Client Price"] ?? ""}
                      onChange={(e) => setVal(i, "Client Price", e.target.value)}
                      placeholder="—"
                      className={cell}
                    />
                  </td>
                  <td className="py-2.5 pl-2 text-right">
                    <input
                      type="number"
                      inputMode="decimal"
                      value={r["Designer Price"] ?? ""}
                      onChange={(e) => setVal(i, "Designer Price", e.target.value)}
                      placeholder="—"
                      className={cell}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
