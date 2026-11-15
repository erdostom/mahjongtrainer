// SPDX-License-Identifier: GPL-3.0-or-later
import { describe, expect, it } from 'vitest';
import { calculateChiitoiShanten, calculateShanten, calculateStandardShanten } from '../shanten';
import { calculateDiscardUkeire, calculateUkeire, evaluateBestDiscard, getRemainingTiles } from '../ukeire';
import { calculateWaits } from '../waits';
import { generateRandomHand } from '../generate';
import { tileIndex, wallForAllTiles, type Suit } from '../tiles';

/** Parse "1122m3344p5566s9s" into a 38-slot count array. */
function hand(notation: string): number[] {
  const counts = new Array(38).fill(0);
  for (const [, digits, suit] of notation.matchAll(/(\d+)([mps])/g)) {
    for (const d of digits) counts[tileIndex(suit as Suit, Number(d))]++;
  }
  return counts;
}

const t = (label: string) => tileIndex(label[1] as Suit, Number(label[0]));

function remaining(h: number[]): number[] {
  return getRemainingTiles(wallForAllTiles(), h);
}

describe('calculateChiitoiShanten', () => {
  it('six pairs and a single is tenpai', () => {
    expect(calculateChiitoiShanten(hand('1122m3344p5566s9s'))).toBe(0);
  });

  it('seven pairs is complete', () => {
    expect(calculateChiitoiShanten(hand('1122m3344p5566s99s'))).toBe(-1);
  });

  it('counts a triplet as one pair and one kind', () => {
    // 111m 22m 33p 44p 55s 66s: six "pairs" but only six kinds -> needs a new kind.
    expect(calculateChiitoiShanten(hand('11122m3344p5566s'))).toBe(1);
  });

  it('does not count four of a kind as two pairs', () => {
    expect(calculateChiitoiShanten(hand('111122m3344p5566s'))).toBe(1);
  });

  it('is not possible with fewer than 13 tiles', () => {
    expect(calculateChiitoiShanten(hand('1122m3344p'))).toBe(8);
  });
});

describe('calculateShanten (standard + seven pairs)', () => {
  it('sees seven-pairs tenpai the standard calculation misses', () => {
    const h = hand('1122m3344p5566s9s');
    expect(calculateStandardShanten(h)).toBeGreaterThan(0);
    expect(calculateShanten(h)).toBe(0);
  });

  it('accepts only the pairing tile for a seven-pairs tenpai', () => {
    const h = hand('1122m3344p5566s9s');
    const result = calculateUkeire(h, remaining(h));
    expect(result.tiles).toEqual([t('9s')]);
    expect(result.value).toBe(3);
  });

  it('picks the seven-pairs discard on a 14-tile hand', () => {
    // After drawing 8s: discard 8s or 9s keeps seven-pairs tenpai (3 tiles each).
    const h = hand('1122m3344p5566s89s');
    expect(calculateShanten(h)).toBe(0);
    const ukeire = calculateDiscardUkeire(h, remaining(h));
    expect(ukeire[t('8s')]).toEqual({ value: 3, tiles: [t('9s')] });
    expect(ukeire[t('9s')]).toEqual({ value: 3, tiles: [t('8s')] });
    expect([t('8s'), t('9s')]).toContain(evaluateBestDiscard(ukeire));
    // Breaking a pair is never better here.
    expect(ukeire[t('1m')].value).toBeLessThan(3);
  });

  it('treats a seven-pairs hand as complete after the draw', () => {
    expect(calculateShanten(hand('1122m3344p5566s99s'))).toBe(-1);
  });

  it('does not accept the fourth tile of a triplet for seven pairs', () => {
    // 1-shanten for seven pairs; drawing the 4th 1m does not help.
    const h = hand('11122m3344p5566s');
    expect(calculateChiitoiShanten(h)).toBe(1);
    const result = calculateUkeire(h, remaining(h));
    expect(result.tiles).not.toContain(t('1m'));
  });

  it('takes the minimum when standard and seven pairs tie', () => {
    // 1-shanten both ways: five pairs + 9p 6s 8s for seven pairs;
    // 123m 123m 55p + 77p 68s for standard.
    const h = hand('112233m55779p68s');
    const standard = calculateStandardShanten(h);
    const chiitoi = calculateChiitoiShanten(h);
    expect(standard).toBe(chiitoi);
    expect(calculateShanten(h)).toBe(standard);
    // Acceptance is the union of both shapes' improving tiles.
    const union = calculateUkeire(h, remaining(h)).tiles;
    expect(union).toContain(t('7s')); // standard only: 678s
    expect(union).toContain(t('9p')); // seven pairs only: sixth pair
  });

  it('leaves ordinary hands unchanged', () => {
    for (const notation of ['123m456p789s1199m', '13579m2468p1357s', '123456789m12p5s', '1234m567p88s123s']) {
      const h = hand(notation);
      expect(calculateShanten(h)).toBe(calculateStandardShanten(h));
    }
  });

  it('equals min(standard, chiitoi) on random hands', () => {
    for (let i = 0; i < 300; i++) {
      const { hand: h } = generateRandomHand(i % 2 === 0 ? 13 : 14);
      expect(calculateShanten(h)).toBe(Math.min(calculateStandardShanten(h), calculateChiitoiShanten(h)));
    }
  });

  it('keeps the minimumShanten early exit sound', () => {
    for (let i = 0; i < 300; i++) {
      const { hand: h } = generateRandomHand(13);
      const exact = calculateShanten(h);
      for (const bound of [-1, 0, 1, 2, 3]) {
        const bounded = calculateShanten(h, bound);
        expect(bounded <= bound).toBe(exact <= bound);
      }
    }
  });
});

describe('calculateWaits', () => {
  it('includes seven-pairs waits in a single suit', () => {
    // 112233557799m + 4m: seven pairs waits on 4m (standard shape is not tenpai).
    expect(calculateWaits(hand('1122335577994m'), 'm')).toContain(t('4m'));
  });
});
