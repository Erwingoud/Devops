const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
const QUEUE_NAME = process.env.QUEUE_NAME || 'recipe.created';

let channel = null;

const sleep = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

async function connect() {
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    try {
      const connection = await amqp.connect(RABBITMQ_URL);
      channel = await connection.createChannel();
      await channel.assertQueue(QUEUE_NAME, { durable: true });
      console.log(`[RabbitMQ] Connected to queue: ${QUEUE_NAME}`);
      return;
    } catch (error) {
      console.warn(`[RabbitMQ] Attempt ${attempt} failed: ${error.message}`);
      await sleep(3000);
    }
  }

  console.warn('[RabbitMQ] Could not connect. API will run, but events will not be published.');
}

async function publishRecipeCreated(recipe) {
  if (!channel) {
    console.warn('[RabbitMQ] No channel available. Event skipped.');
    return;
  }

  const payload = {
    event: 'recipe.created',
    recipeId: recipe._id,
    name: recipe.name,
    cuisine: recipe.cuisine,
    createdAt: recipe.createdAt,
  };

  channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(payload)), { persistent: true });
}

module.exports = { connect, publishRecipeCreated };
