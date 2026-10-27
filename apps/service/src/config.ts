import { mkdirSync } from "node:fs";
import { join } from "node:path";

export const resolveDataDir = () => {
  const dir = process.env.FLOW_FACTORY_DATA_DIR ?? join(process.cwd(), ".data");
  mkdirSync(dir, { recursive: true });
  return dir;
};

export const resolveHost = () => process.env.FLOW_FACTORY_HOST ?? "127.0.0.1";

export const resolvePort = () => Number(process.env.FLOW_FACTORY_PORT ?? "3747");

export const resolveTokenPath = (dataDir: string) =>
  process.env.FLOW_FACTORY_TOKEN_PATH ?? join(dataDir, "local.token");

export const resolveDbPath = (dataDir: string) => join(dataDir, "factory.db");
