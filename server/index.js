import { createApp } from "./app.js";
import { assertConfig, config } from "./config.js";
import { connectDb } from "./db.js";

assertConfig();
await connectDb();

const app = createApp();
const server = app.listen(config.port, () => {
  console.log(`[server] Running on port ${config.port}`);
  console.log(`[server] Website/API: http://localhost:${config.port}`);
});

const shutdown = () => server.close(() => process.exit(0));
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
