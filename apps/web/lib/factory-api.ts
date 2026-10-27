import { readFileSync } from "node:fs";
import { join } from "node:path";

const apiBase = process.env.FLOW_FACTORY_URL ?? "http://127.0.0.1:3747";

export const readFactoryToken = () => {
  const path = process.env.FLOW_FACTORY_TOKEN_PATH ?? join(process.cwd(), ".data", "local.token");
  try {
    return readFileSync(path, "utf8").trim();
  } catch {
    return "";
  }
};

export const factoryFetch = async (
  path: string,
  { method = "GET", body }: { method?: string; body?: unknown } = {},
) => {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (method !== "GET") headers.authorization = `Bearer ${readFactoryToken()}`;
  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers,
    cache: "no-store",
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  const json = text ? JSON.parse(text) : {};
  return { ok: response.ok, status: response.status, json };
};
