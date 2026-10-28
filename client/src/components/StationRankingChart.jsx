import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function StationRankingChart({ rankings = [], isDark = true }) {
  const chartData = useMemo(() => {
    const list = [...rankings].slice(0, 8);
    return {
      labels: list.map(r => r.stationname.split(',')[0]),
      datasets: [
        {
          label: 'Average AQI',
          data: list.map(r => r.averageAQI),
          backgroundColor: '#06b6d4',
          hoverBackgroundColor: '#38bdf8',
          borderRadius: 4,
          barThickness: 16
        }
      ]
    };
  }, [rankings]);

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#94a3b8' : '#475569',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => `Avg AQI: ${context.raw}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
        ticks: { 
          color: isDark ? '#64748b' : '#94a3b8',
          font: { size: 10, family: "'Outfit', sans-serif" } 
        },
        title: { 
          display: true, 
          text: 'Average AQI', 
          color: isDark ? '#64748b' : '#94a3b8',
          font: { size: 10, family: "'Outfit', sans-serif" } 
        }
      },
      y: {
        grid: { display: false },
        ticks: { 
          color: isDark ? '#cbd5e1' : '#334155',
          font: { size: 10, weight: '600', family: "'Outfit', sans-serif" } 
        }
      }
    }
  };

  return (
    <div className="analytics-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Station Exposure Ranking</h3>
          <span className="card-subtitle">Highest to lowest pollution exposure</span>
        </div>
      </div>
      <div className="card-body" style={{ minHeight: '260px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
