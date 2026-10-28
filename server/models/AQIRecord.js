const mongoose = require('mongoose');

const aqiRecordSchema = new mongoose.Schema({
  stationid: { type: String, required: true, index: true },
  date: { type: Date, required: true, index: true },
  pm2_5: { type: Number, default: null },
  pm10: { type: Number, default: null },
  no: { type: Number, default: null },
  no2: { type: Number, default: null },
  nox: { type: Number, default: null },
  nh3: { type: Number, default: null },
  co: { type: Number, default: null },
  so2: { type: Number, default: null },
  o3: { type: Number, default: null },
  benzene: { type: Number, default: null },
  toluene: { type: Number, default: null },
  xylene: { type: Number, default: null },
  aqi: { type: Number, required: true, index: true },
  aqi_bucket: { type: String, default: null },
  stationname: { type: String, required: true, index: true },
  city: { type: String, required: true, index: true },
  state: { type: String, default: 'Maharashtra' },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  coordinate_notes: { type: String, default: '' },
  coordinate_source_type: { type: String, default: '' },
  year: { type: Number, required: true, index: true },
  month: { type: Number, required: true },
  month_name: { type: String, required: true },
  quarter: { type: Number, required: true },
  day_of_week: { type: Number, required: true },
  day_name: { type: String, required: true },
  weekend: { type: Number, default: 0 },
  season: { type: String, required: true, index: true },
  aqi_category: { type: String, required: true, index: true },
  predicted_aqi: { type: Number, default: null },
  prediction_error: { type: Number, default: null },
  absolute_error: { type: Number, default: null },
  residual: { type: Number, default: null },
  predicted_aqi_category: { type: String, default: null },
  model_split: { type: String, default: 'Train' }
}, {
  timestamps: true
});

module.exports = mongoose.model('AQIRecord', aqiRecordSchema);
