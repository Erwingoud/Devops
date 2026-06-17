const client = require('prom-client');

client.collectDefaultMetrics();

const recipesCreatedCounter = new client.Counter({
  name: 'recipe_box_recipes_created_total',
  help: 'Total number of recipes created through the API',
});

const httpRequestDuration = new client.Histogram({
  name: 'recipe_box_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
});

function metricsMiddleware(req, res, next) {
  const end = httpRequestDuration.startTimer();

  res.on('finish', () => {
    end({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status: String(res.statusCode),
    });
  });

  next();
}

module.exports = { client, recipesCreatedCounter, metricsMiddleware };
