// SPDX-License-Identifier: GPL-3.0-or-later
// Tile model and indexing utilities.

export type Suit = 'm' | 'p' | 's';
export type TileIndex = number;

export interface Tile {
  suit: Suit;
  value: number;
}

export const SUITS: Suit[] = ['m', 'p', 's'];
export const SUIT_NAMES: Record<Suit, string> = { m: 'Characters', p: 'Circles', s: 'Bamboo' };

export const TILE_INDEX_MIN = 1;
export const TILE_INDEX_MAX = 29;

export function suitOffset(suit: Suit): number {
  switch (suit) {
    case 'm': return 0;
    case 'p': return 10;
    case 's': return 20;
  }
}

export function tileIndex(suit: Suit, value: number): TileIndex {
  return suitOffset(suit) + value;
}

export function tileFromIndex(index: TileIndex): Tile {
  const suitCode = Math.floor(index / 10);
  const suit = (['m', 'p', 's'] as Suit[])[suitCode];
  return { suit, value: index % 10 };
}

export function tileLabel(index: TileIndex): string {
  const { suit, value } = tileFromIndex(index);
  return `${value}${suit}`;
}

export function allTileIndices(): TileIndex[] {
  const indices: TileIndex[] = [];
  for (const suit of SUITS) {
    for (let value = 1; value <= 9; value++) {
      indices.push(tileIndex(suit, value));
    }
  }
  return indices;
}

export function suitTileIndices(suit: Suit): TileIndex[] {
  const indices: TileIndex[] = [];
  for (let value = 1; value <= 9; value++) {
    indices.push(tileIndex(suit, value));
  }
  return indices;
}

export function newHandCounts(): number[] {
  return new Array(38).fill(0);
}

export function wallForSuits(suits: Suit[]): number[] {
  const wall = newHandCounts();
  for (const suit of suits) {
    for (let value = 1; value <= 9; value++) {
      wall[tileIndex(suit, value)] = 4;
    }
  }
  return wall;
}

export function wallForAllTiles(): number[] {
  return wallForSuits(SUITS);
}

export function tilePoolFromWall(wall: number[]): TileIndex[] {
  const pool: TileIndex[] = [];
  for (const index of allTileIndices()) {
    for (let i = 0; i < wall[index]; i++) {
      pool.push(index);
    }
  }
  return pool;
}

export function shuffle<T>(array: T[]): T[] {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

export function removeRandomItem<T>(array: T[]): T {
  const index = randomInt(array.length);
  return array.splice(index, 1)[0];
}

export function handToTileIndices(hand: number[]): TileIndex[] {
  const indices: TileIndex[] = [];
  for (const index of allTileIndices()) {
    for (let i = 0; i < hand[index]; i++) {
      indices.push(index);
    }
  }
  return indices;
}

export function tileIndicesToHand(indices: TileIndex[]): number[] {
  const hand = newHandCounts();
  for (const index of indices) {
    hand[index]++;
  }
  return hand;
}

export function sortTileIndices(indices: TileIndex[]): TileIndex[] {
  return indices.slice().sort((a, b) => a - b);
}

export function handTotal(hand: number[]): number {
  return hand.reduce((sum, count, index) => (index % 10 === 0 ? sum : sum + count), 0);
}

export function cloneHand(hand: number[]): number[] {
  return hand.slice();
}
