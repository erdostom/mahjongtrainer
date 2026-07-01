import { useState } from 'react';
import EfficiencyMode from './modes/EfficiencyMode';
import ChinitsuMode from './modes/ChinitsuMode';
import StatsMode from './modes/StatsMode';
import './App.css';

type Mode = 'efficiency' | 'chinitsu' | 'stats';

const MODES: { key: Mode; label: string }[] = [
  { key: 'efficiency', label: 'Efficiency' },
  { key: 'chinitsu', label: 'Chinitsu Waits' },
  { key: 'stats', label: 'Stats' },
];

function App() {
  const [mode, setMode] = useState<Mode>('efficiency');

  return (
    <div className="app">
      <header className="app-header">
        <h1>Mahjong Trainer</h1>
        <nav className="app-nav">
          {MODES.map(({ key, label }) => (
            <button
              key={key}
              className={`nav-button ${mode === key ? 'active' : ''}`}
              onClick={() => setMode(key)}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>
      <main className="app-main">
        {mode === 'efficiency' && <EfficiencyMode />}
        {mode === 'chinitsu' && <ChinitsuMode />}
        {mode === 'stats' && <StatsMode />}
      </main>
      <footer className="app-footer">
        <a href="https://github.com/erdostom/mahjongtrainer" target="_blank" rel="noopener">GitHub</a> •
        {' '}
        <a href="https://twitter.com/tamas" target="_blank" rel="noopener">Twitter</a> •
        {' '}
        <a href="https://github.com/erdostom/mahjongtrainer/blob/main/LICENSE" target="_blank" rel="noopener">GPL-3.0</a> •
        {' '}
        <a href="https://github.com/erdostom/mahjongtrainer/blob/main/ATTRIBUTION.md" target="_blank" rel="noopener">Attribution</a>
      </footer>
    </div>
  );
}

export default App
