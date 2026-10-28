const express = require('express');
const router = express.Router();
const mlController = require('../controllers/mlController');

router.get('/metrics', mlController.getModelMetrics);
router.get('/feature-importance', mlController.getFeatureImportance);
router.get('/actual-vs-predicted', mlController.getActualVsPredicted);
router.post('/predict', mlController.predictLive);

module.exports = router;
