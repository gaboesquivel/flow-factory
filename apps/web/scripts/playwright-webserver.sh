#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
WEB_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DATA_DIR="$ROOT/.data-playwright"
mkdir -p "$DATA_DIR"

export FLOW_FACTORY_DATA_DIR="$DATA_DIR"
export FLOW_FACTORY_PORT=3747
export FLOW_FACTORY_URL="http://127.0.0.1:3747"
export FLOW_FACTORY_TOKEN_PATH="$DATA_DIR/local.token"

cd "$ROOT"
pnpm --filter @flow-factory/service exec node --import tsx src/main.ts &
SERVICE_PID=$!
trap 'kill "$SERVICE_PID" 2>/dev/null || true' EXIT INT TERM

for _ in $(seq 1 60); do
  if curl -sf "http://127.0.0.1:3747/health" >/dev/null; then
    break
  fi
  sleep 0.25
done

cd "$WEB_DIR"
exec pnpm exec next dev --port 3750
