// SPDX-License-Identifier: GPL-3.0-or-later

import { useEffect, useState } from 'react';
import TileImage from '../components/TileImage';
import { generateChinitsuHand } from '../engine/generate';
import { tileFromIndex, tileIndex, type Suit, type TileIndex } from '../engine/tiles';
import {
  loadChinitsuAttempts,
  saveChinitsuAttempts,
  type ChinitsuAttempt,
} from '../storage';
import './ChinitsuMode.css';

function setsEqual(a: Set<TileIndex>, b: Set<TileIndex>): boolean {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}

export default function ChinitsuMode() {
  const [handTiles, setHandTiles] = useState<TileIndex[]>([]);
  const [suit, setSuit] = useState<Suit>('m');
  const [waits, setWaits] = useState<TileIndex[]>([]);
  const [selected, setSelected] = useState<Set<TileIndex>>(new Set());
  const [answered, setAnswered] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [attempts, setAttempts] = useState<ChinitsuAttempt[]>(loadChinitsuAttempts());

  useEffect(() => {
    newHand();
  }, []);

  function newHand() {
    const result = generateChinitsuHand();
    setHandTiles(result.handTiles);
    setSuit(result.suit);
    setWaits(result.waits);
    setSelected(new Set());
    setAnswered(false);
    setStartTime(Date.now());
  }

  function toggleTile(tile: TileIndex) {
    if (answered) return;
    const next = new Set(selected);
    if (next.has(tile)) {
      next.delete(tile);
    } else {
      next.add(tile);
    }
    setSelected(next);
  }

  function confirm() {
    if (answered || selected.size === 0) return;

    const correct = setsEqual(new Set(waits), selected);
    const timeMs = Date.now() - startTime;

    const attempt: ChinitsuAttempt = {
      timestamp: Date.now(),
      correct,
      timeMs,
      waits: waits.slice().sort((a, b) => a - b),
      selectedWaits: Array.from(selected).sort((a, b) => a - b),
    };

    const updated = [...attempts, attempt];
    setAttempts(updated);
    saveChinitsuAttempts(updated);
    setAnswered(true);
  }

  const suitTiles = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(v => tileIndex(suit, v));
  const correct = setsEqual(new Set(waits), selected);

  return (
    <div className="chinitsu-mode">
      <div className="mode-description">
        Select all tiles this single-suit hand is waiting on.
      </div>

      <div className="hand-display">
        {handTiles.map((tile, index) => (
          <TileImage key={index} tile={tile} />
        ))}
      </div>

      <div className="wait-buttons">
        {suitTiles.map(tile => {
          const isSelected = selected.has(tile);
          const isWait = waits.includes(tile);
          const isIncorrect = answered && isSelected && !isWait;
          return (
            <button
              key={tile}
              className={`wait-button ${isSelected ? 'selected' : ''}`}
              onClick={() => toggleTile(tile)}
              disabled={answered}
            >
              <TileImage
                tile={tile}
                selected={isSelected || (answered && isWait)}
                incorrect={isIncorrect}
              />
            </button>
          );
        })}
      </div>

      <div className="chinitsu-actions">
        <button className="primary-button" onClick={confirm} disabled={answered || selected.size === 0}>
          Confirm
        </button>
        <button className="primary-button" onClick={newHand}>
          Next Hand
        </button>
      </div>

      {answered && (
        <div className={`result-panel ${correct ? 'correct' : 'incorrect'}`}>
          {correct ? 'Correct!' : 'Not quite.'}
          <div className="waits-list">
            Waits: {waits.map(t => tileLabel(t)).join(', ')}
          </div>
        </div>
      )}

      <div className="stats-summary">
        Attempts: {attempts.length} | Correct: {attempts.filter(a => a.correct).length} (
        {attempts.length ? Math.round((attempts.filter(a => a.correct).length / attempts.length) * 100) : 0}%)
      </div>
    </div>
  );
}

function tileLabel(tile: TileIndex): string {
  const { suit, value } = tileFromIndex(tile);
  return `${value}${suit}`;
}
