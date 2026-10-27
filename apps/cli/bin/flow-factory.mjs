#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join } from "node:path";

const base = process.env.FLOW_FACTORY_URL ?? "http://127.0.0.1:3747";
const tokenPath =
  process.env.FLOW_FACTORY_TOKEN_PATH ?? join(process.cwd(), ".data", "local.token");

const readToken = () => {
  try {
    return readFileSync(tokenPath, "utf8").trim();
  } catch {
    return "";
  }
};

const [command, ...args] = process.argv.slice(2);

const request = async (path, { method = "GET", body } = {}) => {
  const headers = { "content-type": "application/json" };
  if (method !== "GET") headers.authorization = `Bearer ${readToken()}`;
  const response = await fetch(`${base}${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  const json = text ? JSON.parse(text) : {};
  if (!response.ok) {
    console.error(json);
    process.exit(1);
  }
  return json;
};

if (command === "status") {
  console.log(JSON.stringify(await request("/v1/factory/status"), null, 2));
} else if (command === "tasks") {
  console.log(JSON.stringify(await request("/v1/tasks"), null, 2));
} else if (command === "task" && args[0]) {
  console.log(JSON.stringify(await request(`/v1/tasks/${encodeURIComponent(args[0])}`), null, 2));
} else {
  console.log(`Usage: flow-factory <status|tasks|task <id>>`);
  process.exit(1);
}
