// SPDX-License-Identifier: GPL-3.0-or-later
// Shanten calculation: standard shape (4 groups + 1 pair, adapted from
// Riichi-Trainer), seven pairs (chiitoitsu), and the combined minimum.

export function calculateStandardShanten(handToCheck: number[], minimumShanten_ = -2): number {
  const hand = handToCheck.slice();
  let completeSets = 0;
  let pair = 0;
  let partialSets = 0;
  let bestShanten = 8;
  const hasGivenMinimum = minimumShanten_ !== -2;
  const minimumShanten = hasGivenMinimum ? minimumShanten_ : -1;

  function removeCompletedSets(i: number): void {
    if (bestShanten <= minimumShanten) return;

    for (; i < hand.length && hand[i] === 0; i++) { /* skip empties */ }

    if (i >= hand.length) {
      removePotentialSets(1);
      return;
    }

    // Triplet
    if (hand[i] >= 3) {
      completeSets++;
      hand[i] -= 3;
      removeCompletedSets(i);
      hand[i] += 3;
      completeSets--;
    }

    // Sequence
    if (i < 30 && hand[i + 1] !== 0 && hand[i + 2] !== 0) {
      completeSets++;
      hand[i]--; hand[i + 1]--; hand[i + 2]--;
      removeCompletedSets(i);
      hand[i]++; hand[i + 1]++; hand[i + 2]++;
      completeSets--;
    }

    // Try not using this tile in a complete set
    removeCompletedSets(i + 1);
  }

  function removePotentialSets(i: number): void {
    if (bestShanten <= minimumShanten) return;

    if (hasGivenMinimum && completeSets < 3 - minimumShanten) return;

    for (; i < hand.length && hand[i] === 0; i++) { /* skip empties */ }

    if (i >= hand.length) {
      const currentShanten = 8 - (completeSets * 2) - partialSets - pair;
      if (currentShanten < bestShanten) {
        bestShanten = currentShanten;
      }
      return;
    }

    if (completeSets + partialSets < 4) {
      // Pair
      if (hand[i] === 2) {
        partialSets++;
        hand[i] -= 2;
        removePotentialSets(i);
        hand[i] += 2;
        partialSets--;
      }

      // Edge or side wait protorun
      if (i < 30 && hand[i + 1] !== 0) {
        partialSets++;
        hand[i]--; hand[i + 1]--;
        removePotentialSets(i);
        hand[i]++; hand[i + 1]++;
        partialSets--;
      }

      // Closed wait protorun
      if (i < 30 && i % 10 <= 8 && hand[i + 2] !== 0) {
        partialSets++;
        hand[i]--; hand[i + 2]--;
        removePotentialSets(i);
        hand[i]++; hand[i + 2]++;
        partialSets--;
      }
    }

    removePotentialSets(i + 1);
  }

  // Try every possible pair candidate
  for (let i = 1; i < hand.length; i++) {
    if (hand[i] >= 2) {
      pair++;
      hand[i] -= 2;
      removeCompletedSets(1);
      hand[i] += 2;
      pair--;
    }
  }

  // Then try with no pair
  removeCompletedSets(1);

  return bestShanten;
}

/**
 * Seven pairs (chiitoitsu) shanten for a closed 13/14-tile hand.
 *
 * shanten = 6 - pairs + max(0, 7 - distinctKinds)
 *
 * A triplet or quad counts as one pair and one kind: four of a kind is not
 * two pairs. Returns 8 (worse than any real shanten) for hands with fewer
 * than 13 tiles, where seven pairs is impossible.
 */
export function calculateChiitoiShanten(hand: number[]): number {
  let tiles = 0;
  let pairs = 0;
  let kinds = 0;
  for (let i = 1; i < hand.length; i++) {
    if (i % 10 === 0) continue;
    const count = hand[i];
    if (count === 0) continue;
    tiles += count;
    kinds++;
    if (count >= 2) pairs++;
  }
  if (tiles < 13) return 8;
  return 6 - Math.min(pairs, 7) + Math.max(0, 7 - kinds);
}

/**
 * Shanten of the hand's best shape: min(standard, seven pairs).
 *
 * `minimumShanten` has the same contract as in calculateStandardShanten: when
 * given, the search may stop as soon as it proves shanten <= minimumShanten,
 * so the result is only exact up to that bound. Seven pairs is cheap, so it is
 * checked first and can skip the standard search entirely.
 */
export function calculateShanten(hand: number[], minimumShanten = -2): number {
  const chiitoi = calculateChiitoiShanten(hand);
  if (minimumShanten !== -2 && chiitoi <= minimumShanten) return chiitoi;
  return Math.min(chiitoi, calculateStandardShanten(hand, minimumShanten));
}

export default calculateStandardShanten;
