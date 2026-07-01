// SPDX-License-Identifier: GPL-3.0-or-later
// Random hand generation.

import { calculateStandardShanten } from './shanten';
import {
  handToTileIndices,
  newHandCounts,
  randomInt,
  shuffle,
  sortTileIndices,
  SUITS,
  tileIndex,
  tileIndicesToHand,
  type Suit,
  type TileIndex,
  wallForSuits,
} from './tiles';

export function randomSuit(): Suit {
  return SUITS[randomInt(SUITS.length)];
}

export function generateRandomHand(size: number, suits: Suit[] = SUITS): { hand: number[]; handTiles: TileIndex[]; wall: number[] } {
  const fullWall = wallForSuits(suits);
  const pool = handToTileIndices(fullWall);
  const shuffled = shuffle(pool);
  const handTiles = sortTileIndices(shuffled.slice(0, size));
  const wallTiles = shuffled.slice(size);
  const hand = tileIndicesToHand(handTiles);
  const wall = tileIndicesToHand(wallTiles);
  return { hand, handTiles, wall };
}

function generateSingleSuitWinningHand(suit: Suit): number[] {
  while (true) {
    const counts = new Map<number, number>();
    let valid = true;

    // 4 groups
    for (let i = 0; i < 4; i++) {
      if (Math.random() < 0.5) {
        // Sequence
        const start = randomInt(7) + 1;
        for (let v = start; v < start + 3; v++) {
          counts.set(v, (counts.get(v) || 0) + 1);
        }
      } else {
        // Triplet
        const v = randomInt(9) + 1;
        counts.set(v, (counts.get(v) || 0) + 3);
      }
    }

    // Pair
    const pair = randomInt(9) + 1;
    counts.set(pair, (counts.get(pair) || 0) + 2);

    for (const count of counts.values()) {
      if (count > 4) {
        valid = false;
        break;
      }
    }

    if (!valid) continue;

    const hand = newHandCounts();
    for (const [value, count] of counts) {
      hand[tileIndex(suit, value)] = count;
    }

    if (calculateStandardShanten(hand) === -1) {
      return hand;
    }
  }
}

export interface ChinitsuHand {
  hand: number[];
  handTiles: TileIndex[];
  waits: TileIndex[];
  suit: Suit;
}

export function generateChinitsuHand(): ChinitsuHand {
  while (true) {
    const suit = randomSuit();
    const winningHand = generateSingleSuitWinningHand(suit);

    if (calculateStandardShanten(winningHand) !== -1) continue;

    const hand = winningHand.slice();
    const removable: TileIndex[] = [];
    for (const value of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      const index = tileIndex(suit, value);
      if (hand[index] > 0) removable.push(index);
    }

    const removed = removable[randomInt(removable.length)];
    hand[removed]--;

    if (calculateStandardShanten(hand) !== 0) continue;

    const waits: TileIndex[] = [];
    for (const value of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      const index = tileIndex(suit, value);
      hand[index]++;
      if (calculateStandardShanten(hand) === -1) {
        waits.push(index);
      }
      hand[index]--;
    }

    if (waits.length > 0) {
      return { hand, handTiles: sortTileIndices(handToTileIndices(hand)), waits, suit };
    }
  }
}

export function generateEfficiencyHand(): { hand: number[]; handTiles: TileIndex[]; wall: number[]; drawnIndex: number } {
  while (true) {
    const result = generateRandomHand(14, SUITS);
    if (calculateStandardShanten(result.hand) !== -1) {
      return { ...result, drawnIndex: result.handTiles.length - 1 };
    }
  }
}
