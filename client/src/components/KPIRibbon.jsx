import React from 'react';
import { Activity, Wind, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function KPIRibbon({ kpis }) {
  const {
    averageAQI = 103.06,
    averagePM25 = 36.67,
    maxAQI = 323,
    poorOrWorseDays = 333,
    mae = 8,
    exactMae = 8.05,
    r2 = 0.74
  } = kpis || {};

  return (
    <div className="kpi-ribbon-grid">
      {/* 1. Average AQI */}
      <div className="kpi-card card-cyan">
        <div className="kpi-header">
          <span className="kpi-label">Average AQI</span>
          <div className="kpi-icon-wrap icon-cyan">
            <Activity size={16} />
          </div>
        </div>
        <div className="kpi-value-row">
          <div className="kpi-value">{averageAQI}</div>
          <span className="kpi-badge badge-cyan">Moderate</span>
        </div>
        <div className="kpi-footer">
          <span>Citywide mean across stations</span>
        </div>
      </div>

      {/* 2. Average PM2.5 */}
      <div className="kpi-card card-amber">
        <div className="kpi-header">
          <span className="kpi-label">Average PM 2.5</span>
          <div className="kpi-icon-wrap icon-amber">
            <Wind size={16} />
          </div>
        </div>
        <div className="kpi-value-row">
          <div className="kpi-value">{averagePM25}</div>
          <span className="kpi-badge badge-amber">µg/m³</span>
        </div>
        <div className="kpi-footer">
          <span>Primary fine particulate driver</span>
        </div>
      </div>

      {/* 3. Maximum AQI */}
      <div className="kpi-card card-rose">
        <div className="kpi-header">
          <span className="kpi-label">Maximum AQI</span>
          <div className="kpi-icon-wrap icon-rose">
            <TrendingUp size={16} />
          </div>
        </div>
        <div className="kpi-value-row">
          <div className="kpi-value">{maxAQI}</div>
          <span className="kpi-badge badge-rose">Peak Severe</span>
        </div>
        <div className="kpi-footer">
          <span>Peak observed episode</span>
        </div>
      </div>

      {/* 4. Poor or Worse Station Days */}
      <div className="kpi-card card-purple">
        <div className="kpi-header">
          <span className="kpi-label">Poor+ Station Days</span>
          <div className="kpi-icon-wrap icon-purple">
            <AlertTriangle size={16} />
          </div>
        </div>
        <div className="kpi-value-row">
          <div className="kpi-value">{poorOrWorseDays}</div>
          <span className="kpi-badge badge-purple">&gt;200 AQI</span>
        </div>
        <div className="kpi-footer">
          <span>Days exceeding safety threshold</span>
        </div>
      </div>

      {/* 5. Mean Absolute Error */}
      <div className="kpi-card card-emerald">
        <div className="kpi-header">
          <span className="kpi-label">Mean Absolute Error</span>
          <div className="kpi-icon-wrap icon-emerald">
            <CheckCircle2 size={16} />
          </div>
        </div>
        <div className="kpi-value-row">
          <div className="kpi-value">{mae}</div>
          <span className="kpi-badge badge-emerald">R²: {r2}</span>
        </div>
        <div className="kpi-footer">
          <span>Exact MAE: {exactMae} (RF Model)</span>
        </div>
      </div>
    </div>
  );
}
