import { DatabaseSync } from "node:sqlite";

export const openDatabase = (path: string) => {
  const db = new DatabaseSync(path);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS factory_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL DEFAULT '',
      column TEXT NOT NULL DEFAULT 'backlog',
      blocked INTEGER NOT NULL DEFAULT 0,
      priority TEXT,
      assignee TEXT,
      active_specialist TEXT,
      revision INTEGER NOT NULL DEFAULT 1,
      acceptance_criteria TEXT NOT NULL DEFAULT '[]',
      run_id TEXT,
      run_status TEXT,
      sync_error TEXT
    );
    CREATE TABLE IF NOT EXISTS reservations (
      task_id TEXT PRIMARY KEY,
      holder TEXT NOT NULL,
      claimed_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS handoffs (
      task_id TEXT PRIMARY KEY,
      summary TEXT NOT NULL,
      next_action TEXT NOT NULL,
      context TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      revision INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS runs (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      status TEXT NOT NULL,
      specialist TEXT NOT NULL,
      adapter TEXT NOT NULL,
      model TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      evidence TEXT,
      error TEXT
    );
    CREATE TABLE IF NOT EXISTS idempotency (
      key TEXT PRIMARY KEY,
      response_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  return db;
};

export const getMeta = (db: DatabaseSync, key: string) => {
  const row = db.prepare("SELECT value FROM factory_meta WHERE key = ?").get(key) as
    | { value: string }
    | undefined;
  return row?.value ?? null;
};

export const setMeta = (db: DatabaseSync, key: string, value: string) => {
  db.prepare(
    "INSERT INTO factory_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  ).run(key, value);
};
