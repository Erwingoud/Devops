const client = require('prom-client');

client.collectDefaultMetrics();

const mealPlansCreatedCounter = new client.Counter({
  name: 'meal_planner_plans_created_total',
  help: 'Total number of meal plan suggestions created from recipe events',
});

const messagesProcessedCounter = new client.Counter({
  name: 'meal_planner_messages_processed_total',
  help: 'Total number of RabbitMQ messages processed by the meal planner service',
  labelNames: ['status'],
});

module.exports = { client, mealPlansCreatedCounter, messagesProcessedCounter };
