const dataStore = require('../data/dataStore');

function parseFilters(query) {
  const filters = {};
  if (query.year) {
    filters.year = query.year.includes(',') ? query.year.split(',') : query.year;
  }
  if (query.category) {
    filters.category = query.category.includes(',') ? query.category.split(',') : query.category;
  }
  if (query.station) {
    filters.station = query.station.includes(',') ? query.station.split(',') : query.station;
  }
  if (query.season) {
    filters.season = query.season.includes(',') ? query.season.split(',') : query.season;
  }
  if (query.startDate) filters.startDate = query.startDate;
  if (query.endDate) filters.endDate = query.endDate;
  return filters;
}

const CATEGORY_COLORS = {
  'Good': '#10b981',         // Emerald Green
  'Satisfactory': '#0ea5e9', // Sky Blue
  'Moderate': '#f59e0b',     // Amber
  'Poor': '#8b5cf6',         // Purple (as in original Power BI: Poor is purple)
  'Very Poor': '#ec4899',    // Pink / Magenta
  'Severe': '#e11d48'        // Crimson
};

exports.getKPIs = (req, res) => {
  const filters = parseFilters(req.query);
  const records = dataStore.filterRecords(filters);

  if (records.length === 0) {
    return res.json({
      averageAQI: 0,
      averagePM25: 0,
      maxAQI: 0,
      poorOrWorseDays: 0,
      mae: dataStore.metadata?.metrics?.MAE || 8.05,
      r2: dataStore.metadata?.metrics?.R2 || 0.74,
      totalRecords: 0,
      activeStations: 0
    });
  }

  let sumAQI = 0;
  let maxAQI = 0;
  let pm25Sum = 0;
  let pm25Count = 0;
  let poorOrWorseDays = 0;
  const stationsSet = new Set();

  for (const r of records) {
    sumAQI += r.aqi;
    if (r.aqi > maxAQI) maxAQI = r.aqi;
    if (r.pm2_5 !== null) {
      pm25Sum += r.pm2_5;
      pm25Count += 1;
    }
    if (['Poor', 'Very Poor', 'Severe'].includes(r.aqi_category)) {
      poorOrWorseDays += 1;
    }
    stationsSet.add(r.stationname);
  }

  const averageAQI = Number((sumAQI / records.length).toFixed(2));
  const averagePM25 = pm25Count > 0 ? Number((pm25Sum / pm25Count).toFixed(2)) : 0;

  // Compute MAE on filtered test set if available
  const testRecords = records.filter(r => r.model_split === 'Test' && r.predicted_aqi !== null);
  let computedMAE = dataStore.metadata?.metrics?.MAE || 8.05;
  if (testRecords.length > 0) {
    const sumError = testRecords.reduce((acc, r) => acc + Math.abs(r.aqi - r.predicted_aqi), 0);
    computedMAE = Number((sumError / testRecords.length).toFixed(2));
  }

  res.json({
    averageAQI,
    averagePM25,
    maxAQI,
    poorOrWorseDays,
    mae: Math.round(computedMAE), // Power BI displays 8
    exactMae: computedMAE,
    r2: dataStore.metadata?.metrics?.R2 || 0.74,
    totalRecords: records.length,
    activeStations: stationsSet.size
  });
};

exports.getTimeSeries = (req, res) => {
  const filters = parseFilters(req.query);
  const records = dataStore.filterRecords(filters);

  // Group by date and station
  // Date format YYYY-MM-DD
  const dateStationMap = new Map();
  const stationList = new Set();

  for (const r of records) {
    stationList.add(r.stationname);
    if (!dateStationMap.has(r.date)) {
      dateStationMap.set(r.date, { date: r.date, averageAQI: 0, count: 0, stations: {} });
    }
    const dayItem = dateStationMap.get(r.date);
    dayItem.stations[r.stationname] = r.aqi;
    dayItem.averageAQI += r.aqi;
    dayItem.count += 1;
  }

  const seriesData = Array.from(dateStationMap.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(d => ({
      date: d.date,
      averageAQI: Number((d.averageAQI / d.count).toFixed(1)),
      ...d.stations
    }));

  res.json({
    series: seriesData,
    stations: Array.from(stationList).sort()
  });
};

exports.getStationRanking = (req, res) => {
  const filters = parseFilters(req.query);
  const records = dataStore.filterRecords(filters);

  const map = new Map();
  for (const r of records) {
    if (!map.has(r.stationname)) {
      map.set(r.stationname, {
        stationname: r.stationname,
        stationid: r.stationid,
        city: r.city,
        totalAqi: 0,
        count: 0,
        latitude: r.latitude,
        longitude: r.longitude
      });
    }
    const item = map.get(r.stationname);
    item.totalAqi += r.aqi;
    item.count += 1;
  }

  const rankings = Array.from(map.values())
    .map(st => ({
      stationname: st.stationname,
      stationid: st.stationid,
      city: st.city,
      count: st.count,
      averageAQI: Number((st.totalAqi / st.count).toFixed(2)),
      latitude: st.latitude,
      longitude: st.longitude
    }))
    .sort((a, b) => b.averageAQI - a.averageAQI);

  res.json(rankings);
};

exports.getCategoryDistribution = (req, res) => {
  const filters = parseFilters(req.query);
  const records = dataStore.filterRecords(filters);

  const counts = {
    'Satisfactory': 0,
    'Moderate': 0,
    'Good': 0,
    'Poor': 0,
    'Very Poor': 0,
    'Severe': 0
  };

  for (const r of records) {
    if (counts[r.aqi_category] !== undefined) {
      counts[r.aqi_category] += 1;
    }
  }

  const total = records.length;
  const categories = Object.keys(counts)
    .filter(cat => counts[cat] > 0 || total === 0)
    .map(cat => ({
      category: cat,
      count: counts[cat],
      percentage: total > 0 ? Number(((counts[cat] / total) * 100).toFixed(2)) : 0,
      color: CATEGORY_COLORS[cat] || '#94a3b8'
    }));

  res.json({
    total,
    categories
  });
};

exports.getPollutantScatter = (req, res) => {
  const filters = parseFilters(req.query);
  const pollutant = req.query.pollutant || 'pm2_5';
  const records = dataStore.filterRecords(filters);

  // Return max 1200 sampled points for ultra-fast frontend SVG/Canvas rendering
  const validRecords = records.filter(r => r[pollutant] !== null && r.aqi !== null);
  const step = Math.max(1, Math.floor(validRecords.length / 1000));
  const points = [];

  for (let i = 0; i < validRecords.length; i += step) {
    const r = validRecords[i];
    points.push({
      x: r[pollutant],
      y: r.aqi,
      category: r.aqi_category,
      station: r.stationname,
      date: r.date,
      color: CATEGORY_COLORS[r.aqi_category] || '#0ea5e9'
    });
  }

  res.json({
    pollutant,
    points,
    totalPoints: validRecords.length
  });
};

exports.getGeoStations = (req, res) => {
  const filters = parseFilters(req.query);
  const records = dataStore.filterRecords(filters);

  // Calculate live average AQI per station from filtered records
  const stationAqiMap = new Map();
  for (const r of records) {
    if (!stationAqiMap.has(r.stationid)) {
      stationAqiMap.set(r.stationid, { total: 0, count: 0, max: 0 });
    }
    const item = stationAqiMap.get(r.stationid);
    item.total += r.aqi;
    item.count += 1;
    if (r.aqi > item.max) item.max = r.aqi;
  }

  const stationsResult = dataStore.stations.map(st => {
    const stats = stationAqiMap.get(st.stationid);
    const avgAqi = stats ? Number((stats.total / stats.count).toFixed(2)) : null;
    let category = 'No Observations';
    let color = '#94a3b8'; // gray for zero observations (Navi Mumbai)

    if (avgAqi !== null) {
      if (avgAqi <= 50) { category = 'Good'; color = CATEGORY_COLORS['Good']; }
      else if (avgAqi <= 100) { category = 'Satisfactory'; color = CATEGORY_COLORS['Satisfactory']; }
      else if (avgAqi <= 200) { category = 'Moderate'; color = CATEGORY_COLORS['Moderate']; }
      else if (avgAqi <= 300) { category = 'Poor'; color = CATEGORY_COLORS['Poor']; }
      else if (avgAqi <= 400) { category = 'Very Poor'; color = CATEGORY_COLORS['Very Poor']; }
      else { category = 'Severe'; color = CATEGORY_COLORS['Severe']; }
    }

    return {
      ...st,
      filteredRows: stats ? stats.count : 0,
      averageAQI: avgAqi,
      maxAQI: stats ? stats.max : null,
      category,
      color,
      hasData: stats ? stats.count > 0 : false
    };
  });

  res.json(stationsResult);
};

exports.getFilterOptions = (req, res) => {
  const years = Array.from(new Set(dataStore.records.map(r => r.year))).sort();
  const categories = ['Good', 'Satisfactory', 'Moderate', 'Poor', 'Very Poor', 'Severe'];
  const stations = Array.from(new Set(dataStore.records.map(r => r.stationname))).sort();
  const seasons = ['Winter', 'Summer', 'Monsoon', 'Post-Monsoon'];
  const dates = dataStore.records.map(r => r.date).sort();

  res.json({
    years,
    categories,
    stations,
    seasons,
    minDate: dates[0] || '2018-01-01',
    maxDate: dates[dates.length - 1] || '2020-12-31',
    allStationsMetadata: dataStore.stations
  });
};

exports.exportCSV = (req, res) => {
  const filters = parseFilters(req.query);
  const records = dataStore.filterRecords(filters);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="mumbai_aqi_filtered.csv"');

  const headers = [
    'stationid', 'date', 'stationname', 'city', 'latitude', 'longitude',
    'aqi', 'aqi_category', 'pm2_5', 'pm10', 'no2', 'so2', 'co', 'o3',
    'predicted_aqi', 'prediction_error', 'season', 'year'
  ];

  let csvContent = headers.join(',') + '\n';
  for (const r of records) {
    const row = [
      r.stationid,
      r.date,
      `"${r.stationname}"`,
      r.city,
      r.latitude,
      r.longitude,
      r.aqi,
      r.aqi_category,
      r.pm2_5 ?? '',
      r.pm10 ?? '',
      r.no2 ?? '',
      r.so2 ?? '',
      r.co ?? '',
      r.o3 ?? '',
      r.predicted_aqi ?? '',
      r.prediction_error ?? '',
      r.season,
      r.year
    ];
    csvContent += row.join(',') + '\n';
  }

  res.send(csvContent);
};
