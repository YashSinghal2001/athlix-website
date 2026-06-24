import "dotenv/config";
import { createApp } from "./app.js";

const app = createApp();
const port = Number(process.env.PORT) || 8787;

const server = app.listen(port, () => {
  console.log(`[athlix-server] listening on http://localhost:${port}`);
});

// Graceful shutdown.
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    console.log(`[athlix-server] ${sig} received, shutting down`);
    server.close(() => process.exit(0));
  });
}
