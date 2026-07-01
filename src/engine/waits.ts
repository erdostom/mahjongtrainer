// SPDX-License-Identifier: GPL-3.0-or-later
// Wait calculation for chinitsu hands.

import { calculateStandardShanten } from './shanten';
import { suitTileIndices, type Suit, type TileIndex } from './tiles';

export function calculateWaits(hand: number[], suit: Suit): TileIndex[] {
  const waits: TileIndex[] = [];
  const handCopy = hand.slice();

  for (const index of suitTileIndices(suit)) {
    if (handCopy[index] >= 4) continue;
    handCopy[index]++;
    if (calculateStandardShanten(handCopy) === -1) {
      waits.push(index);
    }
    handCopy[index]--;
  }

  return waits;
}

export function isHandTenpai(hand: number[]): boolean {
  return calculateStandardShanten(hand) === 0;
}

export function isHandComplete(hand: number[]): boolean {
  return calculateStandardShanten(hand) === -1;
}
