// SPDX-License-Identifier: GPL-3.0-or-later

import Hand from '../components/Hand';
import TileImage from '../components/TileImage';
import { tileLabel } from '../engine/tiles';
import type { DiscardResult } from './EfficiencyMode';
import './AcceptanceModal.css';

interface AcceptanceModalProps {
  result: DiscardResult;
  onClose: () => void;
}

export default function AcceptanceModal({ result, onClose }: AcceptanceModalProps) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Acceptance analysis" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Acceptance analysis</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close analysis">
            ✕
          </button>
        </div>
        <p className="modal-subtitle">
          Your discard (<span className="chosen-label">{tileLabel(result.chosenTile)}</span>) vs best (
          <span className="best-label">{tileLabel(result.bestTile)}</span>).
        </p>

        <Hand tiles={result.handTiles} drawnIndex={result.drawnIndex} disabled />

        <div className="ukeire-table">
          {result.options.map(({ tile, value, accepted }) => (
            <div
              key={tile}
              className={`ukeire-row ${tile === result.chosenTile ? 'chosen' : ''} ${tile === result.bestTile ? 'best' : ''}`}
            >
              <div className="option-tile">
                <TileImage
                  tile={tile}
                  width={28}
                  height={39}
                  incorrect={tile === result.chosenTile && !result.optimal}
                />
                <span className="tile-name">{tileLabel(tile)}</span>
              </div>
              <div className="option-accepted">
                {accepted.length === 0 && <span className="muted">—</span>}
                {accepted.map(({ tile: acceptedTile, remaining }) => (
                  <div key={acceptedTile} className="accepted-tile">
                    <TileImage tile={acceptedTile} width={24} height={34} />
                    <span className="accepted-remaining">×{remaining}</span>
                  </div>
                ))}
              </div>
              <span className="ukeire-value">{value} ukeire</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
