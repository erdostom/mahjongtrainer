// SPDX-License-Identifier: GPL-3.0-or-later

import TileImage from './TileImage';
import { type TileIndex } from '../engine/tiles';
import './Hand.css';

interface HandProps {
  tiles: TileIndex[];
  drawnIndex?: number;
  onTileClick?: (tile: TileIndex, index: number) => void;
  disabled?: boolean;
  className?: string;
}

export default function Hand({ tiles, drawnIndex, onTileClick, disabled = false, className = '' }: HandProps) {
  return (
    <div className={`hand ${className}`}>
      {tiles.map((tile, index) => (
        <button
          key={index}
          className="hand-tile-button"
          onClick={() => onTileClick?.(tile, index)}
          disabled={disabled || !onTileClick}
          aria-label={`Tile ${tile}`}
        >
          <TileImage tile={tile} drawn={index === drawnIndex} />
        </button>
      ))}
    </div>
  );
}
