const express = require('express');
const mongoose = require('mongoose');
const { startConsumer } = require('./consumer.js');
const { client } = require('./metrics.js');

const PORT = process.env.PORT || 3001;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://meal-planner-mongo:27017/meal-planner';

const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'meal-planner-service' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

async function start() {
  await mongoose.connect(MONGO_URL);
  console.log('[MealPlanner] Connected to MongoDB');

  app.listen(PORT, () => {
    console.log(`[MealPlanner] health:  http://localhost:${PORT}/health`);
    console.log(`[MealPlanner] metrics: http://localhost:${PORT}/metrics`);
  });

  await startConsumer();
}

start().catch((error) => {
  console.error('[MealPlanner] Startup failed:', error.message);
  process.exit(1);
});
