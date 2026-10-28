import React, { useState } from 'react';
import {
  Cpu,
  X,
  Zap,
  RotateCcw,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Activity,
  CheckCircle2,
  SlidersHorizontal,
  Layers
} from 'lucide-react';
import { predictML } from '../services/api';

const DEFAULT_INPUTS = {
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
};

const PRESETS = [
  {
    id: 'clean',
    name: 'Clean Monsoon Day',
    desc: 'Rain washout with coastal sea breeze',
    badge: '🍃 Clean',
    color: '#10b981',
    values: { pm2_5: 14.5, pm10: 38.0, no2: 14.2, co: 0.45, so2: 8.1, o3: 16.0 }
  },
  {
    id: 'moderate',
    name: 'Typical Moderate Day',
    desc: 'Standard central Mumbai ambient urban air',
    badge: '🌤️ Typical',
    color: '#06b6d4',
    values: { pm2_5: 36.5, pm10: 86.6, no2: 21.4, co: 0.65, so2: 9.6, o3: 20.5 }
  },
  {
    id: 'inversion',
    name: 'Winter Inversion',
    desc: 'Trapped pollutants during cold stagnant weather',
    badge: '🌫️ Inversion',
    color: '#f59e0b',
    values: { pm2_5: 85.0, pm10: 175.0, no2: 48.0, co: 1.45, so2: 16.0, o3: 35.0 }
  },
  {
    id: 'severe',
    name: 'Severe Industrial Smog',
    desc: 'Peak particulate density and traffic accumulation',
    badge: '🏭 Severe',
    color: '#ef4444',
    values: { pm2_5: 165.0, pm10: 295.0, no2: 78.0, co: 2.4, so2: 28.0, o3: 45.0 }
  }
];

export default function MLPredictorModal({ isOpen, onClose }) {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [activePreset, setActivePreset] = useState('moderate');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (field, val) => {
    setActivePreset(null);
    setInputs(prev => ({ ...prev, [field]: parseFloat(val) || 0 }));
  };

  const handlePreset = (preset) => {
    setActivePreset(preset.id);
    setInputs(prev => ({ ...prev, ...preset.values }));
    setPrediction(null);
    setError(null);
  };

  const handleReset = () => {
    setActivePreset('moderate');
    setInputs(DEFAULT_INPUTS);
    setPrediction(null);
    setError(null);
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
    <div className="ml-modal-overlay" onClick={onClose}>
      <div className="ml-modal-window" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="ml-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="ml-header-badge">
              <Cpu size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.12rem', fontWeight: '800', letterSpacing: '-0.01em' }}>
                  Live Random Forest ML AQI Predictor
                </h2>
                <span style={{
                  fontSize: '0.66rem',
                  fontWeight: '700',
                  padding: '2px 7px',
                  borderRadius: '999px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                  border: '1px solid rgba(99, 102, 241, 0.3)'
                }}>
                  Live Inference
                </span>
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Trained Scikit-Learn Model · Multi-Pollutant Regression for Mumbai Urban Air Quality
              </span>
            </div>
          </div>
          <button
            type="button"
            className="ml-modal-close-btn"
            onClick={onClose}
            title="Close Modal (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="ml-modal-body">
          {/* Quick Scenario Presets */}
          <div>
            <div className="ml-presets-header">
              <span className="ml-presets-title">
                <SlidersHorizontal size={13} />
                Quick Scenario Presets
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>
                Click to load calibrated scenario baselines
              </span>
            </div>
            <div className="ml-preset-grid">
              {PRESETS.map(p => {
                const isActive = activePreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePreset(p)}
                    className={`ml-preset-card ${isActive ? 'active' : ''}`}
                    style={isActive ? { borderColor: p.color } : {}}
                  >
                    <div className="ml-preset-top">
                      <span className="ml-preset-name">{p.name}</span>
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: '700',
                        color: p.color,
                        background: `${p.color}15`,
                        padding: '1px 5px',
                        borderRadius: '4px'
                      }}>
                        {p.badge}
                      </span>
                    </div>
                    <span className="ml-preset-desc">{p.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main 2-Column Section */}
          <div className="ml-main-grid">
            {/* Left Column: Pollutant Inputs */}
            <div className="ml-controls-panel">
              <div className="ml-section-header">
                <span className="ml-section-title">
                  <Activity size={14} style={{ color: 'var(--accent-cyan)' }} />
                  Pollutant Inputs (µg/m³)
                </span>
                <button
                  type="button"
                  className="ml-reset-btn"
                  onClick={handleReset}
                  title="Reset inputs to historical median values"
                >
                  <RotateCcw size={11} />
                  Reset Medians
                </button>
              </div>

              {/* PM10 (70.1% Tree Importance) */}
              <div className="ml-slider-card">
                <div className="ml-slider-top">
                  <span className="ml-pollutant-tag">
                    PM10
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                      (Coarse Dust)
                    </span>
                    <span className="ml-weight-badge">★ 70.1% Weight</span>
                  </span>
                  <span className="ml-value-bubble">
                    {inputs.pm10} <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>µg/m³</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="400"
                  step="1"
                  value={inputs.pm10}
                  onChange={(e) => handleChange('pm10', e.target.value)}
                  className="ml-range-input"
                  style={{
                    background: `linear-gradient(to right, #06b6d4 0%, #3b82f6 ${(inputs.pm10 / 400) * 100}%, rgba(255,255,255,0.08) ${(inputs.pm10 / 400) * 100}%)`
                  }}
                />
                <div className="ml-slider-bounds">
                  <span>0 µg/m³</span>
                  <span style={{ color: 'var(--accent-cyan)' }}>Median: 86.6</span>
                  <span>400 µg/m³</span>
                </div>
              </div>

              {/* PM2.5 (18.0% Tree Importance) */}
              <div className="ml-slider-card">
                <div className="ml-slider-top">
                  <span className="ml-pollutant-tag">
                    PM2.5
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                      (Fine Particles)
                    </span>
                    <span className="ml-weight-badge" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#a78bfa', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
                      ★ 18.0% Weight
                    </span>
                  </span>
                  <span className="ml-value-bubble">
                    {inputs.pm2_5} <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>µg/m³</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="250"
                  step="0.5"
                  value={inputs.pm2_5}
                  onChange={(e) => handleChange('pm2_5', e.target.value)}
                  className="ml-range-input"
                  style={{
                    background: `linear-gradient(to right, #8b5cf6 0%, #ec4899 ${(inputs.pm2_5 / 250) * 100}%, rgba(255,255,255,0.08) ${(inputs.pm2_5 / 250) * 100}%)`
                  }}
                />
                <div className="ml-slider-bounds">
                  <span>0 µg/m³</span>
                  <span style={{ color: '#a78bfa' }}>Median: 36.5</span>
                  <span>250 µg/m³</span>
                </div>
              </div>

              {/* Secondary Pollutants (2x2 Grid) */}
              <div className="ml-inputs-2x2">
                <div className="ml-input-box">
                  <div className="ml-input-label-row">
                    <label className="ml-input-label">NO₂ (µg/m³)</label>
                    <span className="ml-input-benchmark">Med: 21.4</span>
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    value={inputs.no2}
                    onChange={(e) => handleChange('no2', e.target.value)}
                    className="ml-number-input"
                  />
                </div>

                <div className="ml-input-box">
                  <div className="ml-input-label-row">
                    <label className="ml-input-label">CO (mg/m³)</label>
                    <span className="ml-input-benchmark">Med: 0.65</span>
                  </div>
                  <input
                    type="number"
                    step="0.05"
                    value={inputs.co}
                    onChange={(e) => handleChange('co', e.target.value)}
                    className="ml-number-input"
                  />
                </div>

                <div className="ml-input-box">
                  <div className="ml-input-label-row">
                    <label className="ml-input-label">SO₂ (µg/m³)</label>
                    <span className="ml-input-benchmark">Med: 9.6</span>
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    value={inputs.so2}
                    onChange={(e) => handleChange('so2', e.target.value)}
                    className="ml-number-input"
                  />
                </div>

                <div className="ml-input-box">
                  <div className="ml-input-label-row">
                    <label className="ml-input-label">O₃ (µg/m³)</label>
                    <span className="ml-input-benchmark">Med: 20.5</span>
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    value={inputs.o3}
                    onChange={(e) => handleChange('o3', e.target.value)}
                    className="ml-number-input"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handlePredict}
                disabled={loading}
                className="ml-compute-btn"
              >
                {loading ? (
                  <>
                    <Sparkles size={18} className="spin-icon" />
                    <span>Evaluating 300 Decision Trees…</span>
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    <span>Compute AQI Prediction</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Column: Prediction Output / Idle State */}
            <div className="ml-output-panel">
              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.65rem 0.85rem',
                  color: '#ef4444',
                  fontSize: '0.78rem',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  marginBottom: '0.8rem'
                }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {prediction ? (
                <div className="ml-result-content">
                  <div className="ml-result-header-row">
                    <span className="ml-result-label">Predicted Air Quality</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>
                      Inference Latency: ~18ms
                    </span>
                  </div>

                  {/* Hero AQI Score */}
                  <div className="ml-score-display">
                    <div
                      className="ml-score-number"
                      style={{ color: prediction.color }}
                    >
                      {prediction.predicted_aqi}
                    </div>
                    <div className="ml-score-badge-wrap">
                      <div
                        className="ml-category-badge"
                        style={{
                          background: `${prediction.color}18`,
                          color: prediction.color,
                          borderColor: `${prediction.color}45`
                        }}
                      >
                        <span
                          className="ml-cat-dot"
                          style={{ background: prediction.color }}
                        />
                        {prediction.category}
                      </div>
                      <span className="ml-baseline-diff">
                        {prediction.predicted_aqi > 105
                          ? `▲ +${(prediction.predicted_aqi - 105).toFixed(1)} vs Mumbai baseline`
                          : `▼ ${(105 - prediction.predicted_aqi).toFixed(1)} below Mumbai baseline`}
                      </span>
                    </div>
                  </div>

                  {/* Health Advisory */}
                  <div
                    className="ml-advisory-card"
                    style={{
                      borderLeftColor: prediction.color,
                      background: `${prediction.color}0a`
                    }}
                  >
                    <div className="ml-advisory-title">
                      {prediction.predicted_aqi <= 100 ? (
                        <ShieldCheck size={15} style={{ color: prediction.color }} />
                      ) : (
                        <ShieldAlert size={15} style={{ color: prediction.color }} />
                      )}
                      <span>Public Health Advisory</span>
                    </div>
                    <p className="ml-advisory-text">
                      {prediction.advisory}
                    </p>
                  </div>

                  {/* Pollutant Status vs Historical Benchmark */}
                  <div className="ml-benchmark-section">
                    <div className="ml-benchmark-title">
                      Input Levels vs Mumbai Median Benchmark
                    </div>
                    <div className="ml-benchmark-pills">
                      {prediction.pollutant_status.slice(0, 6).map(p => (
                        <span
                          key={p.pollutant}
                          className={`ml-benchmark-chip status-${p.status}`}
                        >
                          <strong>{p.pollutant.toUpperCase()}</strong>: {p.value ?? '—'}
                          <span style={{ opacity: 0.75, fontSize: '0.64rem' }}>
                            ({p.status})
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Idle Ready State */
                <div className="ml-idle-container">
                  <div className="ml-idle-icon-wrap">
                    <Cpu size={28} />
                  </div>
                  <div>
                    <div className="ml-idle-title">Ready for Live Inference</div>
                    <p className="ml-idle-subtitle">
                      Adjust pollutant sliders or pick a quick scenario preset to evaluate immediate Mumbai AQI regression.
                    </p>
                  </div>
                  <div className="ml-idle-features">
                    <div className="ml-idle-feature-row">
                      <Layers size={14} style={{ color: 'var(--accent-cyan)' }} />
                      <span><strong>300 Decision Trees</strong> capturing non-linear particulate interactions</span>
                    </div>
                    <div className="ml-idle-feature-row">
                      <CheckCircle2 size={14} style={{ color: '#10b981' }} />
                      <span><strong>R² = 0.74 · MAE = 8.05</strong> validated on out-of-sample test split</span>
                    </div>
                    <div className="ml-idle-feature-row">
                      <Activity size={14} style={{ color: '#a78bfa' }} />
                      <span><strong>Calibrated Baseline</strong> from 3,097 Mumbai & Navi Mumbai daily records</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Output Panel Sub-footer */}
              <div style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '0.65rem',
                marginTop: '0.8rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.69rem',
                color: 'var(--text-faint)'
              }}>
                <span>RandomForest (300 estimators)</span>
                <span>MAE: 8.05 · R²: 0.74</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="ml-modal-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#10b981'
            }} />
            <span>Python Scikit-Learn Model Online · 80/20 Chronological Split</span>
          </div>
          <span>Target Metric: <strong>AQI (Daily Ambient Composite)</strong></span>
        </div>
      </div>
    </div>
  );
}
