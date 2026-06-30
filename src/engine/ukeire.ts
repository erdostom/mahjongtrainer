// SPDX-License-Identifier: GPL-3.0-or-later
// Ukeire (tile acceptance) calculation, adapted from Riichi-Trainer.

import { calculateStandardShanten } from './shanten';
import { allTileIndices, type TileIndex, wallForAllTiles } from './tiles';

export interface UkeireResult {
  value: number;
  tiles: TileIndex[];
}

export function calculateUkeire(
  hand: number[],
  remainingTiles: number[],
  baseShanten = -2
): UkeireResult {
  const handCopy = hand.slice();

  if (baseShanten === -2) {
    baseShanten = calculateStandardShanten(handCopy);
  }

  let value = 0;
  const tiles: TileIndex[] = [];

  for (const tile of allTileIndices()) {
    if (remainingTiles[tile] === 0) continue;

    handCopy[tile]++;
    if (calculateStandardShanten(handCopy, baseShanten - 1) < baseShanten) {
      value += remainingTiles[tile];
      tiles.push(tile);
    }
    handCopy[tile]--;
  }

  return { value, tiles };
}

export function calculateDiscardUkeire(
  hand: number[],
  remainingTiles: number[]
): UkeireResult[] {
  const results: UkeireResult[] = new Array(38);
  const handCopy = hand.slice();
  const baseShanten = calculateStandardShanten(handCopy);

  for (const tile of allTileIndices()) {
    if (handCopy[tile] === 0) {
      results[tile] = { value: 0, tiles: [] };
      continue;
    }

    handCopy[tile]--;
    results[tile] = calculateUkeire(handCopy, remainingTiles, baseShanten);
    handCopy[tile]++;
  }

  return results;
}

export function getRemainingTiles(fullWall: number[], hand: number[]): number[] {
  const remaining = fullWall.slice();
  for (const tile of allTileIndices()) {
    remaining[tile] = Math.max(0, remaining[tile] - hand[tile]);
  }
  return remaining;
}

export function evaluateBestDiscard(ukeire: UkeireResult[]): TileIndex | null {
  let bestTile: TileIndex | null = null;
  let bestValue = -1;

  for (const tile of allTileIndices()) {
    if (ukeire[tile].value > bestValue) {
      bestValue = ukeire[tile].value;
      bestTile = tile;
    }
  }

  return bestTile;
}

export function isOptimalDiscard(tile: TileIndex, ukeire: UkeireResult[]): boolean {
  const best = evaluateBestDiscard(ukeire);
  return best !== null && ukeire[tile].value === ukeire[best].value;
}

export function calculateUkeireFromOnlyHand(hand: number[]): UkeireResult {
  const remaining = getRemainingTiles(wallForAllTiles(), hand);
  return calculateUkeire(hand.slice(), remaining);
}
