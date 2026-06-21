const amqp = require('amqplib');
const { handleRecipeCreated } = require('./mealPlanner.js');
const { messagesProcessedCounter } = require('./metrics.js');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
const QUEUE_NAME = process.env.QUEUE_NAME || 'recipe.created';

const sleep = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

async function startConsumer() {
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    try {
      const connection = await amqp.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();

      await channel.assertQueue(QUEUE_NAME, { durable: true });
      console.log(`[MealPlanner] Listening to queue: ${QUEUE_NAME}`);

      channel.consume(QUEUE_NAME, async (msg) => {
        if (!msg) {
          return;
        }

        try {
          const payload = JSON.parse(msg.content.toString());
          await handleRecipeCreated(payload);
          messagesProcessedCounter.inc({ status: 'success' });
          channel.ack(msg);
        } catch (error) {
          console.error('[MealPlanner] Could not process message:', error.message);
          messagesProcessedCounter.inc({ status: 'failed' });
          channel.nack(msg, false, false);
        }
      });

      return;
    } catch (error) {
      console.warn(`[MealPlanner] RabbitMQ attempt ${attempt} failed: ${error.message}`);
      await sleep(3000);
    }
  }

  throw new Error('Meal planner service could not connect to RabbitMQ');
}

module.exports = { startConsumer };
