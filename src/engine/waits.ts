// SPDX-License-Identifier: GPL-3.0-or-later
// Wait calculation for chinitsu hands (standard shape and seven pairs).

import { calculateShanten } from './shanten';
import { suitTileIndices, type Suit, type TileIndex } from './tiles';

export function calculateWaits(hand: number[], suit: Suit): TileIndex[] {
  const waits: TileIndex[] = [];
  const handCopy = hand.slice();

  for (const index of suitTileIndices(suit)) {
    if (handCopy[index] >= 4) continue;
    handCopy[index]++;
    if (calculateShanten(handCopy) === -1) {
      waits.push(index);
    }
    handCopy[index]--;
  }

  return waits;
}

export function isHandTenpai(hand: number[]): boolean {
  return calculateShanten(hand) === 0;
}

export function isHandComplete(hand: number[]): boolean {
  return calculateShanten(hand) === -1;
}
