// SPDX-License-Identifier: GPL-3.0-or-later

import TileImage from './TileImage';
import { tileLabel } from '../engine/tiles';
import type { DiscardResult } from '../modes/EfficiencyMode';
import './River.css';

interface RiverProps {
  discards: DiscardResult[];
  onSelect: (result: DiscardResult) => void;
}

export default function River({ discards, onSelect }: RiverProps) {
  if (discards.length === 0) return null;

  return (
    <div className="river">
      <span className="river-label">Discards</span>
      <div className="river-tiles">
        {discards.map((discard, index) => (
          <button
            key={index}
            className={`river-tile-button ${discard.optimal ? '' : 'suboptimal'}`}
            onClick={() => {
              if (!discard.optimal) onSelect(discard);
            }}
            disabled={discard.optimal}
            title={discard.optimal ? undefined : 'Click to view acceptance analysis'}
            aria-label={`Discard ${index + 1}: ${tileLabel(discard.chosenTile)}${discard.optimal ? '' : ', suboptimal, click for analysis'}`}
          >
            <TileImage tile={discard.chosenTile} incorrect={!discard.optimal} />
          </button>
        ))}
      </div>
    </div>
  );
}
