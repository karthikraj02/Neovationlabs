const app = require("./app");
const { connectDB } = require("./config/db");
const { port, nodeEnv } = require("./config/env");

async function start() {
  try {
    await connectDB();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[server] Failed to connect to MongoDB. Exiting.", err.message);
    process.exit(1);
  }

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] neovationlabs-api listening on port ${port} (${nodeEnv})`);
  });
}

start();
