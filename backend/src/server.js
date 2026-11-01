
require("dotenv").config();

const app = require("./app");
const { connectRedis } = require("./config/redis");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`ImpactLink backend running on port ${PORT}`);
  });
};

startServer();
