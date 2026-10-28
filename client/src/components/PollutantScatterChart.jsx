import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const POLLUTANT_NAMES = {
  pm2_5: 'PM 2.5 (µg/m³)',
  pm10: 'PM 10 (µg/m³)',
  no2: 'NO2 (µg/m³)',
  co: 'CO (mg/m³)',
  so2: 'SO2 (µg/m³)',
  o3: 'O3 (µg/m³)'
};

const CATEGORY_COLORS = {
  'Good': '#10b981',         // Emerald
  'Satisfactory': '#06b6d4', // Cyan
  'Moderate': '#f59e0b',     // Amber
  'Poor': '#8b5cf6',         // Purple
  'Very Poor': '#ec4899',    // Pink
  'Severe': '#ef4444'        // Rose
};

export default function PollutantScatterChart({ 
  scatterData, 
  activePollutant = 'pm2_5', 
  onPollutantChange,
  isDark = true
}) {
  const { points = [], pollutant = 'pm2_5' } = scatterData || {};

  const chartData = useMemo(() => {
    const groups = {};
    for (const pt of points) {
      const cat = pt.category || 'Satisfactory';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push({ x: pt.x, y: pt.y, station: pt.station, date: pt.date });
    }

    const datasets = Object.keys(groups).map(cat => ({
      label: cat,
      data: groups[cat],
      backgroundColor: CATEGORY_COLORS[cat] || '#06b6d4',
      pointRadius: 2.8,
      pointHoverRadius: 6
    }));

    return { datasets };
  }, [points]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 8,
          usePointStyle: true,
          pointStyle: 'circle',
          color: isDark ? '#94a3b8' : '#64748b',
          font: { size: 10, family: "'Outfit', sans-serif" }
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#94a3b8' : '#475569',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (ctx) => {
            const raw = ctx.raw;
            return `${ctx.dataset.label}: (${raw.x}, AQI: ${raw.y}) · ${raw.station ? raw.station.split(',')[0] : ''}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: { 
          display: true, 
          text: POLLUTANT_NAMES[pollutant] || pollutant, 
          color: isDark ? '#64748b' : '#94a3b8',
          font: { size: 10, family: "'Outfit', sans-serif" } 
        },
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
        ticks: { 
          color: isDark ? '#64748b' : '#94a3b8',
          font: { size: 10, family: "'Outfit', sans-serif" } 
        }
      },
      y: {
        title: { 
          display: true, 
          text: 'AQI Value', 
          color: isDark ? '#64748b' : '#94a3b8',
          font: { size: 10, family: "'Outfit', sans-serif" } 
        },
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
        ticks: { 
          color: isDark ? '#64748b' : '#94a3b8',
          font: { size: 10, family: "'Outfit', sans-serif" } 
        }
      }
    }
  };

  return (
    <div className="analytics-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Pollutant Correlation: {pollutant.toUpperCase()}</h3>
          <span className="card-subtitle">Correlation against observed AQI</span>
        </div>
        <div>
          <select 
            value={pollutant} 
            onChange={(e) => onPollutantChange && onPollutantChange(e.target.value)}
            style={{
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              fontFamily: 'inherit',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
          >
            <option value="pm2_5">PM 2.5</option>
            <option value="pm10">PM 10</option>
            <option value="no2">NO2</option>
            <option value="co">CO</option>
            <option value="so2">SO2</option>
            <option value="o3">O3</option>
          </select>
        </div>
      </div>
      <div className="card-body" style={{ minHeight: '260px' }}>
        <Scatter data={chartData} options={options} />
      </div>
    </div>
  );
}
