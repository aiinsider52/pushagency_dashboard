"use client";

import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { WorkflowStat } from "@/lib/types";
import { wfColor } from "@/lib/theme";

type OrbitRingProps = {
  successRate: number;
  workflows: WorkflowStat[];
};

export default function OrbitRing({ successRate, workflows }: OrbitRingProps) {
  const top = workflows.slice(0, 8);
  const data = top.map((w) => ({ name: w.code, value: w.total }));

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-[200px] h-[200px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={92}
              paddingAngle={2}
              isAnimationActive={false}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={wfColor(i)} stroke="var(--color-surface)" strokeWidth={3} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="text-center">
            <div className="text-[36px] font-extrabold text-ink leading-none tabular-nums">{successRate}%</div>
            <div className="text-[11px] text-muted mt-0.5 font-medium">success rate</div>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-2 w-full">
        <div className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-3">Top workflows</div>
        {top.map((w, i) => (
          <div key={w.workflowId} className="flex items-center gap-3 text-sm">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: wfColor(i) }} />
            <span className="font-mono text-[10px] font-semibold text-brand bg-brand/10 rounded-md px-1.5 py-0.5">{w.code}</span>
            <span className="flex-1 truncate text-ink/80">{w.name}</span>
            <span className="text-muted tabular-nums text-xs">{w.total.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
