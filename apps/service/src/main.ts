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

const dataDir = resolveDataDir();
const db = openDatabase(resolveDbPath(dataDir));
const store = createStore(db);
store.markRunsUnknownOnRestart();

const token = ensureLocalToken(resolveTokenPath(dataDir));
const host = resolveHost();
const port = resolvePort();

const server = createHttpServer({ store, token });

server.listen(port, host, () => {
  console.log(`Flow Factory service listening on http://${host}:${port}`);
  console.log(`Local token file: ${resolveTokenPath(dataDir)}`);
});
