const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const BASE_DIR = path.resolve(__dirname, '..');

const dataStore = require('./data/dataStore');
const analyticsRoutes = require('./routes/analyticsRoutes');
const mlRoutes = require('./routes/mlRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection (optional, seamlessly falls back to memory dataStore)
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB successfully.'))
    .catch(err => console.warn('MongoDB connection failed. Continuing with in-memory data store:', err.message));
} else {
  console.log('No MONGODB_URI provided. Running high-performance in-memory Document store with Mongoose schema ready.');
}

// Routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ml', mlRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    recordsCount: dataStore.records.length,
    stationsCount: dataStore.stations.length,
    modelReady: !!dataStore.metadata,
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static build if available
const CLIENT_DIST = path.join(BASE_DIR, 'client/dist');
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

// Start server
async function startServer() {
  try {
    await dataStore.load();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Analytics API available at http://localhost:${PORT}/api/analytics`);
      console.log(`ML Inference API available at http://localhost:${PORT}/api/ml`);
    });
  } catch (err) {
    console.error('Fatal: Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
