// SPDX-License-Identifier: GPL-3.0-or-later

import {
  loadEfficiencyAttempts,
  loadChinitsuAttempts,
  clearAllStats,
  bucketedAverage,
} from '../storage';
import './StatsMode.css';

export default function StatsMode() {
  const efficiency = loadEfficiencyAttempts();
  const chinitsu = loadChinitsuAttempts();

  const efficiencyAccuracy = bucketedAverage(
    efficiency,
    10,
    (bucket) => Math.round((bucket.filter(a => a.chosenUkeire === a.bestUkeire).length / bucket.length) * 100)
  );

  const efficiencyRatio = bucketedAverage(
    efficiency,
    10,
    (bucket) => {
      const chosen = bucket.reduce((sum, a) => sum + a.chosenUkeire, 0);
      const best = bucket.reduce((sum, a) => sum + a.bestUkeire, 0);
      return best > 0 ? Math.round((chosen / best) * 100) : 0;
    }
  );

  const chinitsuAccuracy = bucketedAverage(
    chinitsu,
    10,
    (bucket) => Math.round((bucket.filter(a => a.correct).length / bucket.length) * 100)
  );

  const chinitsuTime = bucketedAverage(
    chinitsu,
    10,
    (bucket) => Math.round(bucket.reduce((sum, a) => sum + a.timeMs, 0) / bucket.length / 1000)
  );

  return (
    <div className="stats-mode">
      <h2>Statistics</h2>

      <section className="stats-section">
        <h3>Efficiency</h3>
        <p>
          {efficiency.length} attempts ·{' '}
          {efficiency.length
            ? Math.round((efficiency.filter(a => a.chosenUkeire === a.bestUkeire).length / efficiency.length) * 100)
            : 0}
          % optimal
        </p>
        {efficiencyAccuracy.length > 1 && (
          <Chart title="Accuracy per 10 attempts" data={efficiencyAccuracy} yMax={100} color="#27ae60" />
        )}
        {efficiencyRatio.length > 1 && (
          <Chart title="Chosen / best ukeire % per 10 attempts" data={efficiencyRatio} yMax={100} color="#2980b9" />
        )}
      </section>

      <section className="stats-section">
        <h3>Chinitsu Waits</h3>
        <p>
          {chinitsu.length} attempts ·{' '}
          {chinitsu.length
            ? Math.round((chinitsu.filter(a => a.correct).length / chinitsu.length) * 100)
            : 0}
          % correct · Average time:{' '}
          {chinitsu.length
            ? Math.round(chinitsu.reduce((sum, a) => sum + a.timeMs, 0) / chinitsu.length / 1000)
            : 0}s
        </p>
        {chinitsuAccuracy.length > 1 && (
          <Chart title="Accuracy per 10 attempts" data={chinitsuAccuracy} yMax={100} color="#27ae60" />
        )}
        {chinitsuTime.length > 1 && (
          <Chart title="Average solve time per 10 attempts (seconds)" data={chinitsuTime} color="#e67e22" />
        )}
      </section>

      <button
        className="clear-stats-button"
        onClick={() => {
          clearAllStats();
          window.location.reload();
        }}
      >
        Clear Stats
      </button>
    </div>
  );
}

interface ChartPoint {
  label: string;
  value: number;
}

interface ChartProps {
  title: string;
  data: ChartPoint[];
  width?: number;
  height?: number;
  color?: string;
  yMax?: number;
}

function Chart({ title, data, width = 320, height = 160, color = '#2980b9', yMax }: ChartProps) {
  const padding = 32;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const max = yMax ?? Math.max(...data.map(d => d.value), 1);
  const min = 0;
  const stepX = data.length > 1 ? chartWidth / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = padding + i * stepX;
    const y = padding + chartHeight - ((d.value - min) / (max - min)) * chartHeight;
    return { x, y, label: d.label, value: d.value };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="chart">
      <div className="chart-title">{title}</div>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="chart-svg">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#ccc" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#ccc" />
        <text x={padding - 5} y={padding} textAnchor="end" fontSize="10" fill="#666">
          {max}
        </text>
        <text x={padding - 5} y={height - padding} textAnchor="end" fontSize="10" fill="#666">
          {min}
        </text>
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill={color} />
            <title>{`Attempts ${p.label}: ${p.value}`}</title>
          </g>
        ))}
      </svg>
    </div>
  );
}
