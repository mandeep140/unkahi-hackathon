"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { PILLARS, PILLAR_ORDER, type PillarVector } from "@/lib/daymap";

interface Props {
  scores: PillarVector;
}

export function PillarRadarChart({ scores }: Props) {
  const data = PILLAR_ORDER.map((id, i) => ({
    label: PILLARS[id].shortLabel,
    value: scores[i],
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <RadarChart data={data} outerRadius="70%">
        <PolarGrid stroke="#e2dcc7" />
        <PolarAngleAxis
          dataKey="label"
          tick={{ fill: "#837c6b", fontSize: 11 }}
        />
        <Radar
          dataKey="value"
          stroke="#5f8570"
          fill="#5f8570"
          fillOpacity={0.2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function PillarBarChart({ scores }: Props) {
  const data = PILLAR_ORDER.map((id, i) => ({
    label: PILLARS[id].shortLabel,
    value: scores[i],
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ left: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2dcc7" horizontal={false} />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          width={110}
          tick={{ fill: "#837c6b", fontSize: 11 }}
        />
        <Bar dataKey="value" fill="#d98f5f" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
