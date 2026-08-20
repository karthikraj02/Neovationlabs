const mongoose = require("mongoose");
const { mongodbUri } = require("./env");

let isConnected = false;

async function connectDB() {
  if (isConnected) return mongoose.connection;
  if (!mongodbUri) {
    // eslint-disable-next-line no-console
    console.warn("[db] MONGODB_URI is not set — skipping database connection.");
    return null;
  }

  try {
    await mongoose.connect(mongodbUri, {
      serverSelectionTimeoutMS: 8000,
    });
    isConnected = true;
    // eslint-disable-next-line no-console
    console.log("[db] MongoDB connected");
    return mongoose.connection;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[db] MongoDB connection failed:", err.message);
    throw err;
  }
}

module.exports = { connectDB };
