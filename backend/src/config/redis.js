
const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

redisClient.on("connect", () => {
  console.log("Redis: Connecting...");
});

redisClient.on("ready", () => {
  console.log("Redis: Connected successfully!");
});

redisClient.on("error", (error) => {
  console.error("Redis Error:", error.message);
});

redisClient.on("end", () => {
  console.log("Redis: Connection closed.");
});

const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error("Redis connection failed:", error.message);
    console.log("Backend will continue without Redis.");
  }
};

module.exports = {
  redisClient,
  connectRedis,
};
