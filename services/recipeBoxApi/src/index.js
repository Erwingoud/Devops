const mongoose = require('mongoose');
const app = require('./app.js');
const { connect } = require('./rabbitmq.js');

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/recipe-box';

async function start() {
  await mongoose.connect(MONGO_URL);
  await connect();

  app.listen(PORT, () => {
    console.log(`[Recipe Box API] http://localhost:${PORT}`);
    console.log(`[Recipe Box API] health:  http://localhost:${PORT}/health`);
    console.log(`[Recipe Box API] metrics: http://localhost:${PORT}/metrics`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
