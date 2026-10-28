import React, { useState } from 'react';
import { Cpu, X, Zap, CheckCircle, AlertCircle, Info, Sparkles } from 'lucide-react';
import { predictML } from '../services/api';

const PRESETS = [
  {
    name: 'Clean Monsoon Day',
    values: { pm2_5: 14.5, pm10: 38.0, no2: 14.2, co: 0.45, so2: 8.1, o3: 16.0 },
    desc: 'Low vehicular smog with rain washout'
  },
  {
    name: 'Typical Moderate Day',
    values: { pm2_5: 35.0, pm10: 88.0, no2: 23.5, co: 0.75, so2: 10.5, o3: 21.0 },
    desc: 'Typical central Mumbai ambient air quality'
  },
  {
    name: 'Winter Temperature Inversion',
    values: { pm2_5: 85.0, pm10: 175.0, no2: 48.0, co: 1.45, so2: 16.0, o3: 35.0 },
    desc: 'Trapped pollutants during colder dry months'
  },
  {
    name: 'Severe Industrial Smog',
    values: { pm2_5: 165.0, pm10: 295.0, no2: 78.0, co: 2.4, so2: 28.0, o3: 45.0 },
    desc: 'High particulate density event'
  }
];

export default function MLPredictorModal({ isOpen, onClose }) {
  const [inputs, setInputs] = useState({
    pm2_5: 36.5,
    pm10: 86.6,
    no: 18.0,
    no2: 21.4,
    nox: 47.3,
    nh3: 12.0,
    co: 0.65,
    so2: 9.6,
    o3: 20.5,
    benzene: 1.5
  });

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (field, val) => {
    setInputs(prev => ({ ...prev, [field]: parseFloat(val) || 0 }));
  };

  const handlePreset = (preset) => {
    setInputs(prev => ({ ...prev, ...preset.values }));
    setPrediction(null);
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await predictML(inputs);
      if (res.success) {
        setPrediction(res);
      } else {
        setError(res.error || 'Prediction failed');
      }
    } catch (err) {
      setError(err.message || 'Network error reaching ML backend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pbi-modal-overlay">
      <div className="pbi-modal">
        <div className="pbi-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="pbi-logo-badge" style={{ background: '#6366f1', color: '#fff' }}>
              <Cpu size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Live Random Forest ML AQI Predictor</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--pbi-text-muted)' }}>
                Integrated Python Scikit-Learn Model · Same-day AQI Estimation
              </span>
            </div>
          </div>
          <button className="pbi-btn" onClick={onClose} style={{ padding: '0.3rem 0.5rem' }}>
            <X size={16} />
          </button>
        </div>

        <div className="pbi-modal-body">
          {/* Quick Presets */}
          <div style={{ marginBottom: '1.2rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--pbi-text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Quick Scenario Presets
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {PRESETS.map(p => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handlePreset(p)}
                  className="pbi-btn"
                  style={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '0.5rem 0.65rem',
                    textAlign: 'left'
                  }}
                >
                  <strong style={{ fontSize: '0.78rem' }}>{p.name}</strong>
                  <span style={{ fontSize: '0.68rem', color: 'var(--pbi-text-muted)' }}>{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.2rem' }}>
            {/* Input Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', borderBottom: '1px solid var(--pbi-card-border)', paddingBottom: '0.3rem' }}>
                Pollutant Inputs (µg/m³)
              </div>

              {/* PM10 (70.1% importance) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px' }}>
                  <span><strong>PM10</strong> (Coarse Particles) <span style={{ color: '#0078d4', fontSize: '0.7rem' }}>★ 70.1% Weight</span></span>
                  <strong>{inputs.pm10}</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="400"
                  step="1"
                  value={inputs.pm10}
                  onChange={(e) => handleChange('pm10', e.target.value)}
                  style={{ width: '100%', accentColor: '#0078d4' }}
                />
              </div>

              {/* PM2.5 (18.0% importance) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px' }}>
                  <span><strong>PM2.5</strong> (Fine Particles) <span style={{ color: '#0078d4', fontSize: '0.7rem' }}>★ 18.0% Weight</span></span>
                  <strong>{inputs.pm2_5}</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="250"
                  step="0.5"
                  value={inputs.pm2_5}
                  onChange={(e) => handleChange('pm2_5', e.target.value)}
                  style={{ width: '100%', accentColor: '#0078d4' }}
                />
              </div>

              {/* Other Pollutants Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', display: 'block', color: 'var(--pbi-text-muted)' }}>NO2 (µg/m³)</label>
                  <input
                    type="number"
                    value={inputs.no2}
                    onChange={(e) => handleChange('no2', e.target.value)}
                    style={{ width: '100%', padding: '0.3rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--pbi-card-border)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', display: 'block', color: 'var(--pbi-text-muted)' }}>CO (mg/m³)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.co}
                    onChange={(e) => handleChange('co', e.target.value)}
                    style={{ width: '100%', padding: '0.3rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--pbi-card-border)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', display: 'block', color: 'var(--pbi-text-muted)' }}>SO2 (µg/m³)</label>
                  <input
                    type="number"
                    value={inputs.so2}
                    onChange={(e) => handleChange('so2', e.target.value)}
                    style={{ width: '100%', padding: '0.3rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--pbi-card-border)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', display: 'block', color: 'var(--pbi-text-muted)' }}>O3 (µg/m³)</label>
                  <input
                    type="number"
                    value={inputs.o3}
                    onChange={(e) => handleChange('o3', e.target.value)}
                    style={{ width: '100%', padding: '0.3rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--pbi-card-border)' }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handlePredict}
                disabled={loading}
                className="pbi-btn pbi-btn-ml"
                style={{
                  justifyContent: 'center',
                  padding: '0.65rem',
                  fontSize: '0.9rem',
                  marginTop: '0.5rem'
                }}
              >
                {loading ? <Sparkles size={16} className="spin" /> : <Zap size={16} />}
                <span>{loading ? 'Running Random Forest Model…' : 'Compute AQI Prediction'}</span>
              </button>
            </div>

            {/* Prediction Output Result */}
            <div style={{
              background: 'rgba(0,0,0,0.02)',
              border: '1px solid var(--pbi-card-border)',
              borderRadius: '8px',
              padding: '1.2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              {error && (
                <div style={{ color: '#ef4444', fontSize: '0.8rem', display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {prediction ? (
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--pbi-text-muted)', fontWeight: '700' }}>
                    Predicted Air Quality Index
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '4px', marginBottom: '10px' }}>
                    <div style={{ fontSize: '3.2rem', fontWeight: '900', color: prediction.color, lineHeight: 1 }}>
                      {prediction.predicted_aqi}
                    </div>
                    <div>
                      <div style={{ 
                        display: 'inline-block',
                        background: `${prediction.color}20`,
                        color: prediction.color,
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        padding: '3px 8px',
                        borderRadius: '4px'
                      }}>
                        {prediction.category}
                      </div>
                    </div>
                  </div>

                  {/* Health Advisory */}
                  <div style={{ background: 'var(--pbi-card)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--pbi-card-border)', marginBottom: '0.8rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--pbi-text)', marginBottom: '4px' }}>
                      Health Advisory:
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--pbi-text-muted)', lineHeight: 1.4 }}>
                      {prediction.advisory}
                    </p>
                  </div>

                  {/* Benchmark Status */}
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '6px' }}>
                    Pollutant Benchmark Analysis:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {prediction.pollutant_status.slice(0, 6).map(p => (
                      <span 
                        key={p.pollutant}
                        style={{
                          fontSize: '0.68rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: p.status === 'critical' ? 'rgba(239, 68, 68, 0.15)' : p.status === 'elevated' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: p.status === 'critical' ? '#ef4444' : p.status === 'elevated' ? '#f59e0b' : '#10b981',
                          fontWeight: '600'
                        }}
                      >
                        {p.pollutant.toUpperCase()}: {p.value ?? 'N/A'} ({p.status})
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--pbi-text-muted)' }}>
                  <Cpu size={40} style={{ opacity: 0.3, marginBottom: '8px' }} />
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--pbi-text)' }}>
                    Ready for Live Inference
                  </div>
                  <p style={{ fontSize: '0.75rem', marginTop: '4px', maxWidth: '280px' }}>
                    Adjust pollutant sliders and click "Compute AQI Prediction" to evaluate real-time regression.
                  </p>
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--pbi-card-border)', paddingTop: '0.6rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--pbi-text-muted)' }}>
                <span>RandomForest (300 estimators)</span>
                <span>MAE: 8.05 · R²: 0.74</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
