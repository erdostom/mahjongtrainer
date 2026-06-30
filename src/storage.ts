// SPDX-License-Identifier: GPL-3.0-or-later
// LocalStorage persistence for training statistics.

import type { TileIndex } from './engine/tiles';

export interface EfficiencyAttempt {
  timestamp: number;
  chosenTile: TileIndex;
  bestTile: TileIndex;
  chosenUkeire: number;
  bestUkeire: number;
}

export interface ChinitsuAttempt {
  timestamp: number;
  correct: boolean;
  timeMs: number;
  waits: TileIndex[];
  selectedWaits: TileIndex[];
}

export const EFFICIENCY_KEY = 'mahjongtrainer-efficiency';
export const CHINITSU_KEY = 'mahjongtrainer-chinitsu';

export function loadEfficiencyAttempts(): EfficiencyAttempt[] {
  try {
    const raw = localStorage.getItem(EFFICIENCY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveEfficiencyAttempts(attempts: EfficiencyAttempt[]) {
  try {
    localStorage.setItem(EFFICIENCY_KEY, JSON.stringify(attempts));
  } catch {
    /* ignore */
  }
}

export function loadChinitsuAttempts(): ChinitsuAttempt[] {
  try {
    const raw = localStorage.getItem(CHINITSU_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveChinitsuAttempts(attempts: ChinitsuAttempt[]) {
  try {
    localStorage.setItem(CHINITSU_KEY, JSON.stringify(attempts));
  } catch {
    /* ignore */
  }
}

export function clearAllStats() {
  try {
    localStorage.removeItem(EFFICIENCY_KEY);
    localStorage.removeItem(CHINITSU_KEY);
  } catch {
    /* ignore */
  }
}

export function bucketedAverage<T>(
  items: T[],
  bucketSize: number,
  valueFn: (items: T[]) => number
): { label: string; value: number }[] {
  const buckets: T[][] = [];
  for (let i = 0; i < items.length; i += bucketSize) {
    buckets.push(items.slice(i, i + bucketSize));
  }
  return buckets.map((bucket, index) => ({
    label: `${index * bucketSize + 1}-${index * bucketSize + bucket.length}`,
    value: valueFn(bucket),
  }));
}
