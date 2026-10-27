import { chmodSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

export const ensureLocalToken = (path: string) => {
  if (existsSync(path)) return readFileSync(path, "utf8").trim();
  const token = randomBytes(32).toString("hex");
  writeFileSync(path, `${token}\n`, { mode: 0o600 });
  chmodSync(path, 0o600);
  return token;
};

export const authorizeRequest = ({
  header,
  token,
}: {
  header: string | undefined;
  token: string;
}) => {
  if (!header?.startsWith("Bearer ")) return false;
  return header.slice("Bearer ".length).trim() === token;
};
