const express = require('express');
const { client, metricsMiddleware } = require('./metrics.js');
const recipeRoutes = require('./routes.js');

const app = express();

app.use(express.json());
app.use(metricsMiddleware);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'recipe-box-api' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.use('/recipes', recipeRoutes);

module.exports = app;
