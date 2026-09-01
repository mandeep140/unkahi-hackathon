"use client";

import { useState } from "react";
import { getDayMapResults } from "./localStore";

export interface BaselineInfo {
  average: number | null;
  stdDev: number | null;
  streak: number;
  isDeviation: boolean;
}

function computeBaseline(): BaselineInfo {
  const results = getDayMapResults();
  if (results.length === 0) {
    return { average: null, stdDev: null, streak: 0, isDeviation: false };
  }

  const loads = results.map((r) => r.loadPercent);
  const average =
    Math.round((loads.reduce((a, b) => a + b, 0) / loads.length) * 10) / 10;
  const variance =
    loads.reduce((sum, v) => sum + (v - average) ** 2, 0) / loads.length;
  const stdDev = Math.round(Math.sqrt(variance) * 10) / 10;

  let streak = 1;
  for (let i = 1; i < results.length; i++) {
    const prevDay = new Date(results[i - 1].createdAt).toDateString();
    const day = new Date(results[i].createdAt).toDateString();
    const diffDays =
      (new Date(prevDay).getTime() - new Date(day).getTime()) /
      (1000 * 60 * 60 * 24);
    if (diffDays <= 1.5) {
      streak += 1;
    } else {
      break;
    }
  }

  const latest = loads[0];
  const isDeviation = stdDev > 0 && Math.abs(latest - average) > stdDev * 1.25;

  return { average, stdDev, streak, isDeviation };
}

export function useBaseline(): BaselineInfo {
  const [baseline] = useState<BaselineInfo>(() => computeBaseline());
  return baseline;
}