const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/kpis', analyticsController.getKPIs);
router.get('/time-series', analyticsController.getTimeSeries);
router.get('/station-ranking', analyticsController.getStationRanking);
router.get('/category-distribution', analyticsController.getCategoryDistribution);
router.get('/pollutant-scatter', analyticsController.getPollutantScatter);
router.get('/geo-stations', analyticsController.getGeoStations);
router.get('/filter-options', analyticsController.getFilterOptions);
router.get('/export', analyticsController.exportCSV);

module.exports = router;
