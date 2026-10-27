import { join } from "node:path";

import {
  resolveDataDir,
  resolveDbPath,
  resolveHost,
  resolvePort,
  resolveTokenPath,
} from "./config.js";
import { ensureLocalToken } from "./auth.js";
import { openDatabase } from "./db.js";
import { createStore } from "./store.js";
import { createHttpServer } from "./server.js";
import { createCoordinator } from "./coordinator.js";

const dataDir = resolveDataDir();
const repoRoot = join(dataDir, "..");
const db = openDatabase(resolveDbPath(dataDir));
const store = createStore(db);
store.markRunsUnknownOnRestart();

const token = ensureLocalToken(resolveTokenPath(dataDir));
const host = resolveHost();
const port = resolvePort();

const coordinator = createCoordinator({ store, repoRoot });
const server = createHttpServer({
  store,
  token,
  repoRoot,
  onMutation: () => coordinator.tick(),
});

server.listen(port, host, () => {
  console.log(`Flow Factory service listening on http://${host}:${port}`);
  console.log(`Local token file: ${resolveTokenPath(dataDir)}`);
  setInterval(() => coordinator.tick(), 2000);
});
