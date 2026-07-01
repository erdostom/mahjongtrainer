// SPDX-License-Identifier: GPL-3.0-or-later

import { useEffect, useState } from 'react';
import Hand from '../components/Hand';
import { generateEfficiencyHand } from '../engine/generate';
import { calculateStandardShanten } from '../engine/shanten';
import {
  calculateDiscardUkeire,
  evaluateBestDiscard,
  type UkeireResult,
} from '../engine/ukeire';
import { drawTile, handToTileIndices, sortTileIndices, tileFromIndex, type TileIndex } from '../engine/tiles';
import {
  loadEfficiencyAttempts,
  saveEfficiencyAttempts,
  type EfficiencyAttempt,
} from '../storage';
import './EfficiencyMode.css';

interface DiscardResult {
  chosenTile: TileIndex;
  bestTile: TileIndex;
  chosenUkeire: number;
  bestUkeire: number;
  optimal: boolean;
  options: { tile: TileIndex; value: number }[];
}

export default function EfficiencyMode() {
  const [handTiles, setHandTiles] = useState<TileIndex[]>([]);
  const [wallCounts, setWallCounts] = useState<number[]>([]);
  const [drawnIndex, setDrawnIndex] = useState<number>(13);
  const [ukeire, setUkeire] = useState<UkeireResult[]>([]);
  const [bestTile, setBestTile] = useState<TileIndex | null>(null);
  const [handTenpai, setHandTenpai] = useState(false);
  const [lastDiscard, setLastDiscard] = useState<DiscardResult | null>(null);
  const [roundComplete, setRoundComplete] = useState(false);
  const [roundDiscards, setRoundDiscards] = useState<DiscardResult[]>([]);
  const [attempts, setAttempts] = useState<EfficiencyAttempt[]>(loadEfficiencyAttempts());

  useEffect(() => {
    newRound();
  }, []);

  function newRound() {
    const result = generateEfficiencyHand();
    const handCounts = tileCountsFromTiles(result.handTiles);
    const discards = calculateDiscardUkeire(handCounts, result.wall);
    const best = evaluateBestDiscard(discards);
    const tenpai = calculateStandardShanten(handCounts) === 0;

    setHandTiles(result.handTiles);
    setWallCounts(result.wall);
    setDrawnIndex(result.drawnIndex);
    setUkeire(discards);
    setBestTile(best);
    setHandTenpai(tenpai);
    setLastDiscard(null);
    setRoundDiscards([]);
    setRoundComplete(tenpai);
  }

  function handleTileClick(tile: TileIndex, index: number) {
    if (roundComplete || bestTile === null) return;

    const chosenUkeire = ukeire[tile].value;
    const bestUkeire = ukeire[bestTile].value;
    const optimal = chosenUkeire === bestUkeire;

    const options = handTiles
      .filter((t, i, arr) => arr.indexOf(t) === i)
      .map(t => ({ tile: t, value: ukeire[t]?.value ?? 0 }))
      .sort((a, b) => b.value - a.value);

    const result: DiscardResult = {
      chosenTile: tile,
      bestTile,
      chosenUkeire,
      bestUkeire,
      optimal,
      options,
    };

    const attempt: EfficiencyAttempt = {
      timestamp: Date.now(),
      chosenTile: tile,
      bestTile,
      chosenUkeire,
      bestUkeire,
    };
    const updatedAttempts = [...attempts, attempt];
    setAttempts(updatedAttempts);
    saveEfficiencyAttempts(updatedAttempts);

    const newRoundDiscards = [...roundDiscards, result];
    setRoundDiscards(newRoundDiscards);
    setLastDiscard(result);

    let newHandTiles = handTiles.slice();
    newHandTiles.splice(index, 1);
    newHandTiles = sortTileIndices(newHandTiles);

    const handCounts13 = tileCountsFromTiles(newHandTiles);
    const shantenAfterDiscard = calculateStandardShanten(handCounts13);
    const wallEmpty = handToTileIndices(wallCounts).length === 0;

    if (shantenAfterDiscard === 0 || wallEmpty) {
      setHandTiles(newHandTiles);
      setDrawnIndex(-1);
      setHandTenpai(shantenAfterDiscard === 0);
      setRoundComplete(true);
      return;
    }

    let wallCopy = wallCounts.slice();
    const handCounts13ForDraw = tileCountsFromTiles(newHandTiles);
    const drawn = drawTile(handCounts13ForDraw, wallCopy);
    if (drawn === null) {
      setHandTiles(newHandTiles);
      setDrawnIndex(-1);
      setHandTenpai(false);
      setRoundComplete(true);
      return;
    }

    newHandTiles.push(drawn);
    const handCounts14 = tileCountsFromTiles(newHandTiles);
    const tenpai = calculateStandardShanten(handCounts14) === 0;
    const newDiscards = calculateDiscardUkeire(handCounts14, wallCopy);
    const newBest = evaluateBestDiscard(newDiscards);

    setHandTiles(newHandTiles);
    setWallCounts(wallCopy);
    setDrawnIndex(newHandTiles.length - 1);
    setUkeire(newDiscards);
    setBestTile(newBest);
    setHandTenpai(tenpai);

    if (tenpai) {
      setRoundComplete(true);
    }
  }

  const optimalCount = roundDiscards.filter(d => d.optimal).length;

  return (
    <div className="efficiency-mode">
      <div className="mode-description">
        {roundComplete
          ? handTenpai
            ? 'Tenpai! Round complete.'
            : 'Round complete.'
          : 'Discard tiles to maximize ukeire. The round continues until your hand is tenpai.'}
      </div>

      <Hand tiles={handTiles} drawnIndex={drawnIndex} onTileClick={handleTileClick} disabled={roundComplete} />

      {lastDiscard && (
        <div className="result-panel">
          <div className={lastDiscard.optimal ? 'correct' : 'incorrect'}>
            {lastDiscard.optimal
              ? `Correct! ${tileLabel(lastDiscard.chosenTile)} is best (${lastDiscard.chosenUkeire} ukeire).`
              : `You chose ${tileLabel(lastDiscard.chosenTile)} (${lastDiscard.chosenUkeire} ukeire). Best was ${tileLabel(lastDiscard.bestTile)} (${lastDiscard.bestUkeire} ukeire).`}
          </div>
          <div className="ukeire-table">
            {lastDiscard.options.map(({ tile, value }) => (
              <div
                key={tile}
                className={`ukeire-row ${tile === lastDiscard.chosenTile ? 'chosen' : ''} ${tile === lastDiscard.bestTile ? 'best' : ''}`}
              >
                <span className="tile-name">{tileLabel(tile)}</span>
                <span className="ukeire-value">{value} ukeire</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {roundComplete && (
        <div className="round-summary">
          Round complete. {roundDiscards.length} discards, {optimalCount} optimal.
        </div>
      )}

      <button className="primary-button" onClick={newRound}>
        {roundComplete ? 'Next Hand' : 'New Hand'}
      </button>

      <div className="stats-summary">
        Total attempts: {attempts.length} | Optimal:{' '}
        {attempts.filter(a => a.chosenUkeire === a.bestUkeire).length}
      </div>
    </div>
  );
}

function tileCountsFromTiles(tiles: TileIndex[]): number[] {
  const counts = new Array(38).fill(0);
  for (const tile of tiles) {
    counts[tile]++;
  }
  return counts;
}

function tileLabel(tile: TileIndex): string {
  const { suit, value } = tileFromIndex(tile);
  return `${value}${suit}`;
}
