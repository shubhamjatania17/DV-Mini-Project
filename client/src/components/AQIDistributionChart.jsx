import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const CATEGORY_COLORS = {
  'Good': '#10b981',         // Emerald
  'Satisfactory': '#06b6d4', // Cyan
  'Moderate': '#f59e0b',     // Amber
  'Poor': '#8b5cf6',         // Purple
  'Very Poor': '#ec4899',    // Pink
  'Severe': '#ef4444'        // Rose
};

export default function AQIDistributionChart({ distribution, isDark = true }) {
  const { total = 3872, categories = [] } = distribution || {};

  const chartData = useMemo(() => {
    return {
      labels: categories.map(c => c.category),
      datasets: [
        {
          data: categories.map(c => c.count),
          backgroundColor: categories.map(c => CATEGORY_COLORS[c.category] || '#94a3b8'),
          borderColor: isDark ? '#111827' : '#ffffff',
          borderWidth: 2,
          hoverOffset: 6
        }
      ]
    };
  }, [categories, isDark]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 8,
          usePointStyle: true,
          pointStyle: 'circle',
          color: isDark ? '#94a3b8' : '#64748b',
          font: { size: 10, family: "'Outfit', sans-serif" },
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const count = data.datasets[0].data[i];
                const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                return {
                  text: `${label} (${pct}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
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
            const count = ctx.raw;
            const pct = total > 0 ? ((count / total) * 100).toFixed(2) : 0;
            return ` ${ctx.label}: ${count.toLocaleString()} (${pct}%)`;
          }
        }
      }
    }
  };

  const formattedTotal = total >= 1000 ? `${(total / 1000).toFixed(2)}K` : total;

  return (
    <div className="analytics-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">AQI Severity Distribution</h3>
          <span className="card-subtitle">Breakdown of days by environmental category</span>
        </div>
      </div>
      <div className="card-body" style={{ position: 'relative', minHeight: '260px' }}>
        <Doughnut data={chartData} options={options} />
        {/* Center label */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '36%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1 }}>
            {formattedTotal}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
            Station Days
          </div>
        </div>
      </div>
    </div>
  );
}
