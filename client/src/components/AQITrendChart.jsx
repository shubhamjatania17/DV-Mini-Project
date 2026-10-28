import React, { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const STATION_COLORS = [
  '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
  '#3b82f6', '#14b8a6', '#f43f5e', '#6366f1', '#84cc16'
];

export default function AQITrendChart({ data, isDark = true }) {
  const [viewMode, setViewMode] = useState('average');
  const { series = [], stations = [] } = data || {};

  const chartData = useMemo(() => {
    if (!series || series.length === 0) {
      return { labels: [], datasets: [] };
    }

    const step = Math.max(1, Math.floor(series.length / 110));
    const sampled = series.filter((_, idx) => idx % step === 0);

    const labels = sampled.map(d => {
      const dt = new Date(d.date);
      return dt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });

    if (viewMode === 'average') {
      return {
        labels,
        datasets: [
          {
            label: 'Average AQI',
            data: sampled.map(d => d.averageAQI),
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.12)',
            fill: true,
            tension: 0.35,
            pointRadius: 1.5,
            pointHoverRadius: 5,
            borderWidth: 2.2
          }
        ]
      };
    } else {
      const datasets = stations.slice(0, 8).map((stName, idx) => {
        const color = STATION_COLORS[idx % STATION_COLORS.length];
        return {
          label: stName.split(',')[0],
          data: sampled.map(d => d[stName] || null),
          borderColor: color,
          backgroundColor: 'transparent',
          tension: 0.25,
          pointRadius: 1,
          pointHoverRadius: 4,
          borderWidth: 1.8,
          spanGaps: true
        };
      });

      return { labels, datasets };
    }
  }, [series, stations, viewMode]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
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
        boxPadding: 4,
        titleFont: { size: 11, weight: 'bold' }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { 
          maxTicksLimit: 7, 
          color: isDark ? '#64748b' : '#94a3b8',
          font: { size: 10, family: "'Outfit', sans-serif" } 
        }
      },
      y: {
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
        ticks: { 
          color: isDark ? '#64748b' : '#94a3b8',
          font: { size: 10, family: "'Outfit', sans-serif" } 
        },
        title: {
          display: true,
          text: 'AQI Level',
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
          <h3 className="card-title">AQI Trend Timeline</h3>
          <span className="card-subtitle">Daily ambient air quality progression (2018–2020)</span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            className={`btn btn-sm ${viewMode === 'average' ? 'btn-active' : 'btn-secondary'}`}
            onClick={() => setViewMode('average')}
          >
            City Mean
          </button>
          <button 
            className={`btn btn-sm ${viewMode === 'stations' ? 'btn-active' : 'btn-secondary'}`}
            onClick={() => setViewMode('stations')}
          >
            By Station
          </button>
        </div>
      </div>
      <div className="card-body" style={{ minHeight: '260px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
