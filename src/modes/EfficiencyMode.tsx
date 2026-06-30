// SPDX-License-Identifier: GPL-3.0-or-later

import { useEffect, useState } from 'react';
import Hand from '../components/Hand';
import { generateEfficiencyHand } from '../engine/generate';
import { calculateDiscardUkeire, evaluateBestDiscard, isOptimalDiscard, type UkeireResult } from '../engine/ukeire';
import { tileFromIndex, type TileIndex } from '../engine/tiles';
import {
  loadEfficiencyAttempts,
  saveEfficiencyAttempts,
  type EfficiencyAttempt,
} from '../storage';
import './EfficiencyMode.css';

export default function EfficiencyMode() {
  const [handTiles, setHandTiles] = useState<TileIndex[]>([]);
  const [ukeire, setUkeire] = useState<UkeireResult[]>([]);
  const [answered, setAnswered] = useState(false);
  const [chosenTile, setChosenTile] = useState<TileIndex | null>(null);
  const [bestTile, setBestTile] = useState<TileIndex | null>(null);
  const [attempts, setAttempts] = useState<EfficiencyAttempt[]>(loadEfficiencyAttempts());

  useEffect(() => {
    newHand();
  }, []);

  function newHand() {
    const result = generateEfficiencyHand();
    setHandTiles(result.handTiles);
    const discards = calculateDiscardUkeire(result.hand, result.wall);
    setUkeire(discards);
    const best = evaluateBestDiscard(discards);
    setBestTile(best);
    setAnswered(false);
    setChosenTile(null);
  }

  function handleTileClick(tile: TileIndex) {
    if (answered || bestTile === null) return;

    const chosenUkeire = ukeire[tile].value;
    const bestUkeire = ukeire[bestTile].value;

    const attempt: EfficiencyAttempt = {
      timestamp: Date.now(),
      chosenTile: tile,
      bestTile,
      chosenUkeire,
      bestUkeire,
    };

    const updated = [...attempts, attempt];
    setAttempts(updated);
    saveEfficiencyAttempts(updated);

    setChosenTile(tile);
    setAnswered(true);
  }

  const sortedDiscards = handTiles
    .filter((tile, index, arr) => arr.indexOf(tile) === index)
    .map(tile => ({ tile, value: ukeire[tile]?.value ?? 0 }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="efficiency-mode">
      <div className="mode-description">
        Click the tile that gives the best discard (most ukeire / tile acceptance).
      </div>

      <Hand tiles={handTiles} onTileClick={handleTileClick} disabled={answered} />

      {answered && chosenTile !== null && bestTile !== null && (
        <div className="result-panel">
          <div className={isOptimalDiscard(chosenTile, ukeire) ? 'correct' : 'incorrect'}>
            {isOptimalDiscard(chosenTile, ukeire)
              ? 'Correct! Best discard.'
              : `Not optimal. Best was ${tileLabel(bestTile)} with ${ukeire[bestTile].value} ukeire.`}
          </div>
          <div className="ukeire-table">
            {sortedDiscards.map(({ tile, value }) => (
              <div
                key={tile}
                className={`ukeire-row ${tile === chosenTile ? 'chosen' : ''} ${tile === bestTile ? 'best' : ''}`}
              >
                <span className="tile-name">{tileLabel(tile)}</span>
                <span className="ukeire-value">{value} ukeire</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="primary-button" onClick={newHand}>
        Next Hand
      </button>

      <div className="stats-summary">
        Total attempts: {attempts.length} | Optimal:{' '}
        {attempts.filter(a => a.chosenUkeire === a.bestUkeire).length}
      </div>
    </div>
  );
}

function tileLabel(tile: TileIndex): string {
  const { suit, value } = tileFromIndex(tile);
  return `${value}${suit}`;
}
