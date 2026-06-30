// SPDX-License-Identifier: GPL-3.0-or-later
// Tile images are from Euophrys/Riichi-Trainer (GPL-3.0).

import { tileFromIndex, type TileIndex } from '../engine/tiles';

interface TileImageProps {
  tile: TileIndex;
  width?: number;
  height?: number;
  highlighted?: boolean;
  selected?: boolean;
  incorrect?: boolean;
  className?: string;
}

export default function TileImage({
  tile,
  width = 40,
  height = 56,
  selected = false,
  incorrect = false,
  className = '',
}: TileImageProps) {
  const { suit, value } = tileFromIndex(tile);
  const src = `/tiles/${value}${suit}.png`;

  let borderColor = '#2c3e50';
  if (selected) borderColor = '#27ae60';
  if (incorrect) borderColor = '#c0392b';

  return (
    <img
      src={src}
      alt={`${value}${suit}`}
      width={width}
      height={height}
      className={className}
      style={{
        display: 'block',
        border: `${selected || incorrect ? 3 : 2}px solid ${borderColor}`,
        borderRadius: '4px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 2px rgba(0,0,0,0.15)',
      }}
    />
  );
}

export function BackTile({ width = 40, height = 56 }: { width?: number; height?: number }) {
  return (
    <img
      src="/tiles/back.png"
      alt="Back tile"
      width={width}
      height={height}
      style={{
        display: 'block',
        border: '2px solid #2c3e50',
        borderRadius: '4px',
        boxShadow: '0 2px 2px rgba(0,0,0,0.15)',
      }}
    />
  );
}
