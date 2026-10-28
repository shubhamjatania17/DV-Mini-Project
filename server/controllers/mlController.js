const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const dataStore = require('../data/dataStore');

const BASE_DIR = path.resolve(__dirname, '../..');
const PREDICT_SCRIPT = path.join(BASE_DIR, 'server/ml/predict.py');

function getPythonCommand() {
  if (process.env.PYTHON_PATH) return process.env.PYTHON_PATH;
  const venvLinux = path.join(BASE_DIR, '.venv/bin/python');
  const venvWin = path.join(BASE_DIR, '.venv/Scripts/python.exe');
  if (fs.existsSync(venvLinux)) return venvLinux;
  if (fs.existsSync(venvWin)) return venvWin;
  return process.platform === 'win32' ? 'python' : 'python3';
}

exports.getModelMetrics = (req, res) => {
  if (!dataStore.metadata) {
    return res.status(503).json({ error: 'Model metadata not yet loaded' });
  }
  res.json({
    metrics: dataStore.metadata.metrics,
    features: dataStore.metadata.features,
    feature_statistics: dataStore.metadata.feature_statistics,
    training_date_range: dataStore.metadata.training_date_range,
    test_date_range: dataStore.metadata.test_date_range
  });
};

exports.getFeatureImportance = (req, res) => {
  if (!dataStore.metadata) {
    return res.status(503).json({ error: 'Model metadata not yet loaded' });
  }
  res.json(dataStore.metadata.feature_importance);
};

exports.getActualVsPredicted = (req, res) => {
  // Pull test split records where predicted_aqi exists
  const testRecords = dataStore.records
    .filter(r => r.model_split === 'Test' && r.predicted_aqi !== null)
    .map(r => ({
      date: r.date,
      station: r.stationname,
      actual: r.aqi,
      predicted: r.predicted_aqi,
      error: r.prediction_error,
      absError: r.absolute_error,
      split: r.model_split
    }));

  // Also include a sample of Train set for contrast
  const trainRecords = dataStore.records
    .filter(r => r.model_split === 'Train')
    .slice(0, 300)
    .map(r => ({
      date: r.date,
      station: r.stationname,
      actual: r.aqi,
      predicted: null,
      error: null,
      split: 'Train'
    }));

  res.json({
    testCount: testRecords.length,
    trainCount: dataStore.records.filter(r => r.model_split === 'Train').length,
    data: [...testRecords, ...trainRecords]
  });
};

exports.predictLive = (req, res) => {
  const inputData = req.body;
  if (!inputData || typeof inputData !== 'object') {
    return res.status(400).json({ success: false, error: 'Request body must be a JSON object of pollutant values' });
  }

  // Execute python predict.py using stdin for 100% reliable cross-platform JSON passing
  const pythonCmd = getPythonCommand();
  const pyProcess = spawn(pythonCmd, [PREDICT_SCRIPT]);

  let stdoutData = '';
  let stderrData = '';

  pyProcess.stdout.on('data', (chunk) => {
    stdoutData += chunk.toString();
  });

  pyProcess.stderr.on('data', (chunk) => {
    stderrData += chunk.toString();
  });

  pyProcess.on('close', (code) => {
    if (code !== 0) {
      console.error('Python predict process failed with code', code, stderrData);
      return res.status(500).json({
        success: false,
        error: 'Prediction model execution failed',
        details: stderrData || stdoutData
      });
    }

    try {
      const parsed = JSON.parse(stdoutData.trim());
      res.json(parsed);
    } catch (err) {
      console.error('Failed to parse Python output:', stdoutData);
      res.status(500).json({
        success: false,
        error: 'Failed to parse model prediction output',
        raw: stdoutData
      });
    }
  });

  // Write payload to stdin and close
  pyProcess.stdin.write(JSON.stringify(inputData));
  pyProcess.stdin.end();
};
