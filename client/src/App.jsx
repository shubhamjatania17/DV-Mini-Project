import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/PowerBIHeader';
import KPIRibbon from './components/KPIRibbon';
import AQITrendChart from './components/AQITrendChart';
import StationRankingChart from './components/StationRankingChart';
import PollutantScatterChart from './components/PollutantScatterChart';
import GeographicMap from './components/GeographicMap';
import AQIDistributionChart from './components/AQIDistributionChart';
import ActualVsPredictedChart from './components/ActualVsPredictedChart';
import FeatureImportanceChart from './components/FeatureImportanceChart';
import FiltersSidebar from './components/FiltersSidebar';
import MLPredictorModal from './components/MLPredictorModal';

import {
  fetchKPIs,
  fetchTimeSeries,
  fetchStationRanking,
  fetchCategoryDistribution,
  fetchPollutantScatter,
  fetchGeoStations,
  fetchFilterOptions,
  fetchFeatureImportance,
  fetchActualVsPredicted,
  fetchModelMetrics
} from './services/api';

export default function App() {
  const [filters, setFilters] = useState({
    year: 'All',
    category: 'All',
    station: 'All',
    season: 'All'
  });

  const [filterOptions, setFilterOptions] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [timeSeries, setTimeSeries] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [distribution, setDistribution] = useState(null);
  const [scatterData, setScatterData] = useState(null);
  const [activePollutant, setActivePollutant] = useState('pm2_5');
  const [geoStations, setGeoStations] = useState([]);
  const [featureImportance, setFeatureImportance] = useState([]);
  const [actualVsPredicted, setActualVsPredicted] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [predictorOpen, setPredictorOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // default modern dark theme

  // Initialize theme
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      setIsDarkMode(false);
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };

  // Load initial static options & model metadata once
  useEffect(() => {
    fetchFilterOptions().then(setFilterOptions).catch(console.error);
    fetchFeatureImportance().then(setFeatureImportance).catch(console.error);
    fetchActualVsPredicted().then(setActualVsPredicted).catch(console.error);
    fetchModelMetrics().then(setModelMetrics).catch(console.error);
  }, []);

  // Load filtered data
  const loadFilteredData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [kpiRes, tsRes, rankRes, distRes, scattRes, geoRes] = await Promise.all([
        fetchKPIs(filters),
        fetchTimeSeries(filters),
        fetchStationRanking(filters),
        fetchCategoryDistribution(filters),
        fetchPollutantScatter(filters, activePollutant),
        fetchGeoStations(filters)
      ]);

      setKpis(kpiRes);
      setTimeSeries(tsRes);
      setRankings(rankRes);
      setDistribution(distRes);
      setScatterData(scattRes);
      setGeoStations(geoRes);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [filters, activePollutant]);

  useEffect(() => {
    loadFilteredData();
  }, [loadFilteredData]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      year: 'All',
      category: 'All',
      station: 'All',
      season: 'All'
    });
  };

  return (
    <div className="app-container">
      {/* Top Header Ribbon */}
      <Header
        filters={filters}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onRefresh={loadFilteredData}
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        onOpenPredictor={() => setPredictorOpen(true)}
        sidebarOpen={sidebarOpen}
        isRefreshing={isRefreshing}
      />

      <div className="layout-body">
        <main className="main-canvas">
          {/* Top KPI Metric Cards */}
          <KPIRibbon kpis={kpis} />

          {/* Grid Row 1 (Visual Analytics) */}
          <div className="cards-grid">
            <div className="grid-col-4">
              <AQITrendChart data={timeSeries} isDark={isDarkMode} />
            </div>
            <div className="grid-col-4">
              <StationRankingChart rankings={rankings} isDark={isDarkMode} />
            </div>
            <div className="grid-col-4">
              <PollutantScatterChart
                scatterData={scatterData}
                activePollutant={activePollutant}
                onPollutantChange={setActivePollutant}
                isDark={isDarkMode}
              />
            </div>
          </div>

          {/* Grid Row 2 (Spatial & Distribution) */}
          <div className="cards-grid">
            <div className="grid-col-4">
              <GeographicMap stations={geoStations} isDark={isDarkMode} />
            </div>
            <div className="grid-col-4">
              <AQIDistributionChart distribution={distribution} isDark={isDarkMode} />
            </div>
            <div className="grid-col-4">
              <ActualVsPredictedChart data={actualVsPredicted} isDark={isDarkMode} />
            </div>
          </div>

          {/* Grid Row 3 (Machine Learning Architecture & Feature Importance) */}
          <div className="cards-grid">
            <div className="grid-col-6">
              <FeatureImportanceChart featureImportance={featureImportance} isDark={isDarkMode} />
            </div>
            <div className="grid-col-6">
              <div className="analytics-card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">ML Pipeline Architecture Summary</h3>
                    <span className="card-subtitle">Random Forest Regressor (Scikit-Learn)</span>
                  </div>
                  <button 
                    className="btn btn-ml btn-sm"
                    onClick={() => setPredictorOpen(true)}
                  >
                    Open Live Predictor
                  </button>
                </div>
                <div className="card-body" style={{ fontSize: '0.84rem', lineHeight: '1.6' }}>
                  <p style={{ marginBottom: '0.6rem' }}>
                    <strong>Target Variable:</strong> Same-day observed <code>AQI</code> (Continuous Regression).
                  </p>
                  <p style={{ marginBottom: '0.6rem' }}>
                    <strong>Features Used:</strong> 10 atmospheric pollutant concentrations (<code>pm10</code>, <code>pm2_5</code>, <code>nox</code>, <code>co</code>, <code>no</code>, <code>o3</code>, <code>no2</code>, <code>nh3</code>, <code>benzene</code>, <code>so2</code>).
                  </p>
                  <p style={{ marginBottom: '0.6rem' }}>
                    <strong>Validation Protocol:</strong> Chronological 80/20 train/test split (3,097 train observations, 775 test observations). Imputed via median training statistics.
                  </p>
                  <div className="metrics-banner-grid">
                    <div className="metric-chip">
                      <div className="chip-label">MAE</div>
                      <div className="chip-val color-green">8.05</div>
                    </div>
                    <div className="metric-chip">
                      <div className="chip-label">RMSE</div>
                      <div className="chip-val color-cyan">12.29</div>
                    </div>
                    <div className="metric-chip">
                      <div className="chip-label">R² Score</div>
                      <div className="chip-val color-purple">0.738</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Slicers Sidebar */}
        <FiltersSidebar
          filterOptions={filterOptions}
          selectedFilters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Live Interactive ML Predictor Modal */}
      <MLPredictorModal
        isOpen={predictorOpen}
        onClose={() => setPredictorOpen(false)}
      />
    </div>
  );
}
