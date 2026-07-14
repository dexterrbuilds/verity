"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ProbabilityPoint } from "@/types";

export function ProbabilityChart({ data, height = 240 }: { data: ProbabilityPoint[]; height?: number }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="probabilityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.35} />
              <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="recordedAt" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, borderColor: "hsl(var(--border))", background: "hsl(var(--card))" }}
            formatter={(value) => [`${value}%`, "Probability"]}
          />
          <Area type="monotone" dataKey="probability" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#probabilityFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
