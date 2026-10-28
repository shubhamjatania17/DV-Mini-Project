const API_BASE = '/api';

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '' && value !== 'All') {
      if (Array.isArray(value)) {
        if (value.length > 0 && !value.includes('All')) {
          query.append(key, value.join(','));
        }
      } else {
        query.append(key, value);
      }
    }
  }
  const qStr = query.toString();
  return qStr ? `?${qStr}` : '';
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchKPIs(filters = {}) {
  const res = await fetch(`${API_BASE}/analytics/kpis${buildQuery(filters)}`);
  return res.json();
}

export async function fetchTimeSeries(filters = {}) {
  const res = await fetch(`${API_BASE}/analytics/time-series${buildQuery(filters)}`);
  return res.json();
}

export async function fetchStationRanking(filters = {}) {
  const res = await fetch(`${API_BASE}/analytics/station-ranking${buildQuery(filters)}`);
  return res.json();
}

export async function fetchCategoryDistribution(filters = {}) {
  const res = await fetch(`${API_BASE}/analytics/category-distribution${buildQuery(filters)}`);
  return res.json();
}

export async function fetchPollutantScatter(filters = {}, pollutant = 'pm2_5') {
  const res = await fetch(`${API_BASE}/analytics/pollutant-scatter${buildQuery({ ...filters, pollutant })}`);
  return res.json();
}

export async function fetchGeoStations(filters = {}) {
  const res = await fetch(`${API_BASE}/analytics/geo-stations${buildQuery(filters)}`);
  return res.json();
}

export async function fetchFilterOptions() {
  const res = await fetch(`${API_BASE}/analytics/filter-options`);
  return res.json();
}

export async function fetchModelMetrics() {
  const res = await fetch(`${API_BASE}/ml/metrics`);
  return res.json();
}

export async function fetchFeatureImportance() {
  const res = await fetch(`${API_BASE}/ml/feature-importance`);
  return res.json();
}

export async function fetchActualVsPredicted() {
  const res = await fetch(`${API_BASE}/ml/actual-vs-predicted`);
  return res.json();
}

export async function predictML(pollutantPayload) {
  const res = await fetch(`${API_BASE}/ml/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(pollutantPayload)
  });
  return res.json();
}

export function getExportUrl(filters = {}) {
  return `${API_BASE}/analytics/export${buildQuery(filters)}`;
}
