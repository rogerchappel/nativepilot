#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP="${TMPDIR:-/tmp}/nativepilot-smoke-$$"
APP="$TMP/SmokeApp"
mkdir -p "$TMP"
node "$ROOT/dist/index.js" create SmokeApp --dir "$APP" --providers openai,anthropic,gemini,local > "$TMP/create.json"
node "$ROOT/dist/index.js" doctor "$APP" --fail-on unsafe-key,stale-guidance > "$TMP/doctor.json"
node "$ROOT/dist/index.js" print-agent-brief "$APP" --for codex > "$TMP/brief.md"
node "$APP/scripts/nativepilot-smoke.mjs"
node "$ROOT/dist/index.js" clean-demo "$APP" > "$TMP/clean.json"
test ! -e "$APP/app/chat.tsx"
test -e "$APP/src/ai/client.ts"
echo "nativepilot CLI smoke passed: $APP"
