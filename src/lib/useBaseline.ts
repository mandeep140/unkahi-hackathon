"use client";

import { useState } from "react";
import { getDayMapResults } from "./localStore";

export interface BaselineInfo {
  average: number | null;
  stdDev: number | null;
  streak: number;
  isDeviation: boolean;
  sampleSize: number;
}

function computeBaseline(): BaselineInfo {
  const results = getDayMapResults().filter((r) => r.hasSignal);
  if (results.length === 0) {
    return { average: null, stdDev: null, streak: 0, isDeviation: false, sampleSize: 0 };
  }

  const loads = results.map((r) => r.loadPercent);

  const exactMean = loads.reduce((a, b) => a + b, 0) / loads.length;
  const variance =
    loads.reduce((sum, v) => sum + (v - exactMean) ** 2, 0) / loads.length;
  const exactStdDev = Math.sqrt(variance);

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
  const isDeviation = exactStdDev > 0 && Math.abs(latest - exactMean) > exactStdDev * 1.25;

  return {
    average: Math.round(exactMean * 10) / 10,
    stdDev: Math.round(exactStdDev * 10) / 10,
    streak,
    isDeviation,
    sampleSize: results.length,
  };
}

export function useBaseline(): BaselineInfo {
  const [baseline] = useState<BaselineInfo>(() => computeBaseline());
  return baseline;
}
