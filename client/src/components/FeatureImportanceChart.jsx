import React from 'react';

export default function FeatureImportanceChart({ featureImportance = [] }) {
  const features = featureImportance.length > 0 ? featureImportance : [
    { feature: 'pm10', percentage: 70.09, importance: 0.7009 },
    { feature: 'pm2_5', percentage: 18.04, importance: 0.1804 },
    { feature: 'nox', percentage: 4.45, importance: 0.0445 },
    { feature: 'co', percentage: 3.05, importance: 0.0305 },
    { feature: 'no', percentage: 0.96, importance: 0.0096 },
    { feature: 'o3', percentage: 0.86, importance: 0.0086 },
    { feature: 'no2', percentage: 0.71, importance: 0.0071 },
    { feature: 'nh3', percentage: 0.67, importance: 0.0067 },
    { feature: 'benzene', percentage: 0.66, importance: 0.0066 },
    { feature: 'so2', percentage: 0.51, importance: 0.0051 }
  ];

  return (
    <div className="analytics-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Random Forest Feature Weights</h3>
          <span className="card-subtitle">Relative predictor importance in calculating AQI</span>
        </div>
        <span className="kpi-badge badge-cyan">
          PM10 + PM2.5 = 88.1% Impact
        </span>
      </div>
      <div className="card-body" style={{ minHeight: '260px', display: 'flex', flexDirection: 'column', gap: '9px', justifyContent: 'center' }}>
        {features.map((item, idx) => {
          const isTop = idx < 2;
          return (
            <div key={item.feature} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem' }}>
              <div style={{ width: '65px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-main)', letterSpacing: '0.02em' }}>
                {item.feature}
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '99px', height: '10px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${Math.max(item.percentage, 1.5)}%`, 
                    height: '100%', 
                    background: isTop ? 'linear-gradient(90deg, #06b6d4, #3b82f6)' : 'rgba(148, 163, 184, 0.4)',
                    borderRadius: '99px',
                    transition: 'width 0.4s ease'
                  }} 
                />
              </div>
              <div style={{ width: '48px', textAlign: 'right', fontWeight: '700', color: isTop ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                {item.percentage}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
