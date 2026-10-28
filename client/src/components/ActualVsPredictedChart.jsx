import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function ActualVsPredictedChart({ data, isDark = true }) {
  const { data: records = [] } = data || {};

  const chartData = useMemo(() => {
    const testPoints = records
      .filter(r => r.split === 'Test' && r.predicted !== null)
      .map(r => ({ x: r.predicted, y: r.actual, error: r.error, station: r.station, date: r.date }));

    const maxVal = Math.max(...testPoints.map(p => Math.max(p.x, p.y)), 300);
    const diagonalLine = [
      { x: 0, y: 0 },
      { x: maxVal, y: maxVal }
    ];

    return {
      datasets: [
        {
          label: 'Test Set Predictions',
          data: testPoints,
          backgroundColor: '#06b6d4',
          pointRadius: 3,
          pointHoverRadius: 6
        },
        {
          type: 'line',
          label: 'Perfect Fit (y = x)',
          data: diagonalLine,
          borderColor: 'rgba(244, 63, 94, 0.75)',
          borderDash: [5, 5],
          borderWidth: 1.6,
          pointRadius: 0,
          fill: false
        }
      ]
    };
  }, [records]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 8,
          usePointStyle: true,
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
            if (!raw.error) return `${ctx.dataset.label}`;
            return `Actual: ${raw.y} | Pred: ${raw.x} (Err: ${raw.error.toFixed(1)}) · ${raw.station ? raw.station.split(',')[0] : ''}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: { 
          display: true, 
          text: 'Predicted AQI (Random Forest)', 
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
          text: 'Actual Observed AQI', 
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
          <h3 className="card-title">Actual vs Predicted AQI</h3>
          <span className="card-subtitle">Random Forest regression test validation</span>
        </div>
        <div>
          <span className="kpi-badge badge-emerald">
            R²: 0.74 · MAE: 8.05
          </span>
        </div>
      </div>
      <div className="card-body" style={{ minHeight: '260px' }}>
        <Scatter data={chartData} options={options} />
      </div>
    </div>
  );
}
