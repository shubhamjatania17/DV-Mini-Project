const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const BASE_DIR = path.resolve(__dirname, '../..');
const POWERBI_CSV = path.join(BASE_DIR, 'aqi_outputs/mumbai_navi_mumbai_aqi_powerbi.csv');
const COORDS_CSV = path.join(BASE_DIR, 'station_coordinates_external.csv');
const METADATA_JSON = path.join(BASE_DIR, 'server/ml/metadata.json');

class DataStore {
  constructor() {
    this.records = [];
    this.stations = [];
    this.metadata = null;
    this.isLoaded = false;
  }

  async load() {
    if (this.isLoaded) return;

    console.log('Loading dataset from CSV files...');
    
    // Load metadata JSON
    if (fs.existsSync(METADATA_JSON)) {
      try {
        const metaRaw = fs.readFileSync(METADATA_JSON, 'utf-8');
        this.metadata = JSON.parse(metaRaw);
      } catch (err) {
        console.warn('Could not parse metadata.json:', err.message);
      }
    }

    // Load stations from coordinates file (includes Navi Mumbai stations!)
    const stationMap = new Map();
    if (fs.existsSync(COORDS_CSV)) {
      await new Promise((resolve, reject) => {
        fs.createReadStream(COORDS_CSV)
          .pipe(csv())
          .on('data', (row) => {
            const id = row.StationId || row.stationid;
            stationMap.set(id, {
              stationid: id,
              stationname: (row.StationName || row.stationname || '').replace(/^"|"$/g, ''),
              city: row.City || row.city,
              latitude: parseFloat(row.Latitude || row.latitude) || null,
              longitude: parseFloat(row.Longitude || row.longitude) || null,
              coordinate_notes: row.Coordinate_Notes || row.coordinate_notes || '',
              coordinate_source_type: row.Coordinate_Source_Type || row.coordinate_source_type || '',
              observation_rows: 0
            });
          })
          .on('end', resolve)
          .on('error', reject);
      });
    }

    // Load main powerbi records
    const records = [];
    if (fs.existsSync(POWERBI_CSV)) {
      await new Promise((resolve, reject) => {
        fs.createReadStream(POWERBI_CSV)
          .pipe(csv())
          .on('data', (row) => {
            const parseNum = (v) => {
              if (v === '' || v === undefined || v === null) return null;
              const n = parseFloat(v);
              return isNaN(n) ? null : n;
            };

            const aqi = parseNum(row.aqi);
            if (aqi === null || aqi < 0) return;

            const stId = row.stationid;
            if (stationMap.has(stId)) {
              stationMap.get(stId).observation_rows += 1;
            }

            records.push({
              stationid: row.stationid,
              date: row.date,
              pm2_5: parseNum(row.pm2_5),
              pm10: parseNum(row.pm10),
              no: parseNum(row.no),
              no2: parseNum(row.no2),
              nox: parseNum(row.nox),
              nh3: parseNum(row.nh3),
              co: parseNum(row.co),
              so2: parseNum(row.so2),
              o3: parseNum(row.o3),
              benzene: parseNum(row.benzene),
              toluene: parseNum(row.toluene),
              xylene: parseNum(row.xylene),
              aqi: aqi,
              aqi_bucket: row.aqi_bucket || '',
              stationname: (row.stationname || '').replace(/^"|"$/g, ''),
              city: row.city || 'Mumbai',
              state: row.state || 'Maharashtra',
              latitude: parseNum(row.latitude),
              longitude: parseNum(row.longitude),
              coordinate_notes: row.coordinate_notes || '',
              coordinate_source_type: row.coordinate_source_type || '',
              year: parseInt(row.year, 10),
              month: parseInt(row.month, 10),
              month_name: row.month_name,
              quarter: parseInt(row.quarter, 10),
              day_of_week: parseInt(row.day_of_week, 10),
              day_name: row.day_name,
              weekend: parseInt(row.weekend, 10) || 0,
              season: row.season,
              aqi_category: row.aqi_category,
              predicted_aqi: parseNum(row.predicted_aqi),
              prediction_error: parseNum(row.prediction_error),
              absolute_error: parseNum(row.absolute_error),
              residual: parseNum(row.residual),
              predicted_aqi_category: row.predicted_aqi_category || null,
              model_split: row.model_split || 'Train'
            });
          })
          .on('end', resolve)
          .on('error', reject);
      });
    }

    this.records = records;
    this.stations = Array.from(stationMap.values());
    this.isLoaded = true;

    console.log(`Loaded ${this.records.length} AQI records across ${this.stations.length} total stations.`);
  }

  filterRecords(filters = {}) {
    let list = this.records;

    // Filter Year (e.g., '2018', '2019', '2020' or array)
    if (filters.year && filters.year !== 'All') {
      const years = Array.isArray(filters.year) 
        ? filters.year.map(y => parseInt(y, 10)) 
        : [parseInt(filters.year, 10)];
      list = list.filter(r => years.includes(r.year));
    }

    // Filter AQI Category (e.g. Good, Satisfactory, Moderate, Poor, Very Poor)
    if (filters.category && filters.category !== 'All') {
      const categories = Array.isArray(filters.category) ? filters.category : [filters.category];
      list = list.filter(r => categories.includes(r.aqi_category));
    }

    // Filter Station (e.g. MH005 or stationname)
    if (filters.station && filters.station !== 'All') {
      const stations = Array.isArray(filters.station) ? filters.station : [filters.station];
      list = list.filter(r => stations.includes(r.stationname) || stations.includes(r.stationid));
    }

    // Filter Season (Winter, Summer, Monsoon, Post-Monsoon)
    if (filters.season && filters.season !== 'All') {
      const seasons = Array.isArray(filters.season) ? filters.season : [filters.season];
      list = list.filter(r => seasons.includes(r.season));
    }

    // Filter Date Range
    if (filters.startDate) {
      list = list.filter(r => r.date >= filters.startDate);
    }
    if (filters.endDate) {
      list = list.filter(r => r.date <= filters.endDate);
    }

    return list;
  }
}

const instance = new DataStore();
module.exports = instance;
